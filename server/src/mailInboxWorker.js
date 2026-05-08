'use strict';

const fs = require('fs').promises;
const path = require('path');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const MailComposer = require('nodemailer/lib/mail-composer');
const fetch = require('node-fetch');

const DATA_DIR = path.join(__dirname, '..', '.data');
const PROCESSED_FILE = path.join(DATA_DIR, 'mail-processed-ids.json');

function inboxUser() {
  return process.env.GMAIL_INBOX_USER || process.env.GMAIL_USER || '';
}

function inboxPassword() {
  return process.env.GMAIL_INBOX_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '';
}

function imapConfig() {
  const user = inboxUser();
  const password = inboxPassword();
  if (!user || !password) {
    throw new Error(
      'Set GMAIL_INBOX_USER and GMAIL_INBOX_APP_PASSWORD (use a Gmail App Password, not your normal password).'
    );
  }
  return {
    user,
    password,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    connTimeout: 60000,
    authTimeout: 30000
  };
}

function scanUrl() {
  const port = process.env.PORT || 5000;
  const u = process.env.SCAN_API_URL || `http://127.0.0.1:${port}/api/scan`;
  return u.replace(/\/$/, '');
}

function createTransporter() {
  const user = inboxUser();
  const pass = inboxPassword();
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    requireTLS: true,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

async function loadProcessedIds() {
  try {
    const raw = await fs.readFile(PROCESSED_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

async function saveProcessedIds(set) {
  const arr = [...set];
  const trimmed = arr.length > 5000 ? arr.slice(-5000) : arr;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PROCESSED_FILE, JSON.stringify(trimmed), 'utf8');
}

function connectImap() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig());
    imap.once('ready', () => resolve(imap));
    imap.once('error', reject);
    imap.connect();
  });
}

function openInbox(imap) {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', false, (err) => (err ? reject(err) : resolve()));
  });
}

function uidSearchUnseen(imap) {
  return new Promise((resolve, reject) => {
    imap.search(['UNSEEN'], (err, uids) => {
      if (err) reject(err);
      else resolve(uids || []);
    });
  });
}

function uidFetchRaws(imap, uids) {
  if (!uids.length) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    const rows = [];
    const f = imap.fetch(uids, { bodies: '' });
    f.on('message', (msg) => {
      const chunks = [];
      let uid;
      msg.on('body', (stream) => {
        stream.on('data', (c) => chunks.push(c));
      });
      msg.once('attributes', (a) => {
        uid = a.uid;
      });
      msg.once('end', () => {
        rows.push({ uid, raw: Buffer.concat(chunks) });
      });
    });
    f.once('error', reject);
    f.once('end', () => resolve(rows));
  });
}

function uidAddSeen(imap, uid) {
  return new Promise((resolve, reject) => {
    imap.addFlags(uid, '\\Seen', (err) => (err ? reject(err) : resolve()));
  });
}

function closeImap(imap) {
  return new Promise((resolve) => {
    imap.once('end', resolve);
    imap.end();
  });
}

function firstAddress(fromOrReplyTo) {
  if (!fromOrReplyTo) return null;
  if (fromOrReplyTo.value && fromOrReplyTo.value[0]) {
    return fromOrReplyTo.value[0].address || null;
  }
  return null;
}

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildScanRaw(parsed) {
  const subj = parsed.subject || '';
  const body = (parsed.text || '').trim() || stripHtml(parsed.html || '');
  return `Subject: ${subj}\n\n${body}`;
}

async function postScan(raw) {
  const res = await fetch(scanUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputType: 'email', raw })
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { ok: false, error: 'Invalid JSON from scan API', raw: text };
  }
  if (!res.ok && data.error == null) {
    data = { ok: false, error: data.error || text || `HTTP ${res.status}` };
  }
  return data;
}

function scanJsonForEmailReply(payload) {
  const o = JSON.parse(JSON.stringify(payload));
  if (o.log && typeof o.log === 'object' && 'raw' in o.log) {
    o.log = { ...o.log, raw: '[omitted in email; content was your message]' };
  }
  return o;
}

async function getGoogleAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing OAuth2 credentials in .env');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(`OAuth2 error: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

async function sendResultEmail(transporter, to, subject, payloadJson) {
  const user = inboxUser();
  const body = scanJsonForEmailReply(payloadJson);
  const emailSubject = `[PhishingScan Result] Re: ${subject || '(no subject)'}`;

  // If OAuth2 tokens are provided, use Gmail REST API (Bypasses Render SMTP Block)
  if (process.env.GMAIL_REFRESH_TOKEN) {
    const mail = new MailComposer({
      from: `"Phishing scan" <${user}>`,
      to,
      subject: emailSubject,
      text: JSON.stringify(body, null, 2)
    });
    const rawBuffer = await mail.compile().build();
    const encodedMessage = rawBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const token = await getGoogleAccessToken();
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodedMessage })
    });
    
    if (!res.ok) {
      const errTxt = await res.text();
      throw new Error(`Gmail API failed: ${errTxt}`);
    }
    return;
  }

  // Fallback to local SMTP (works locally, blocked on Render Free)
  await transporter.sendMail({
    from: `"Phishing scan" <${user}>`,
    to,
    subject: emailSubject,
    text: JSON.stringify(body, null, 2)
  });
}

async function processInboxRound() {
  const processed = await loadProcessedIds();
  const imap = await connectImap();
  await openInbox(imap);
  const uids = await uidSearchUnseen(imap);
  if (!uids.length) {
    await closeImap(imap);
    return;
  }
  const rows = await uidFetchRaws(imap, uids);
  await closeImap(imap);

  const transporter = createTransporter();
  const ourUser = inboxUser().toLowerCase();
  const successfulUids = [];

  for (const row of rows) {
    if (!row.uid || !row.raw || !row.raw.length) continue;
    let parsed;
    try {
      parsed = await simpleParser(row.raw);
    } catch (e) {
      console.warn('[mail-inbox] parse failed uid=%s: %s', row.uid, e.message);
      continue;
    }

    const msgId = parsed.messageId || `uid:${row.uid}`;
    if (processed.has(msgId)) {
      successfulUids.push(row.uid);
      continue;
    }

    const fromAddr = (firstAddress(parsed.replyTo) || firstAddress(parsed.from) || '').toLowerCase();
    if (fromAddr && fromAddr === ourUser) {
      successfulUids.push(row.uid);
      processed.add(msgId);
      continue;
    }

    const autoSubmitted = parsed.headers.get('auto-submitted');
    if (autoSubmitted && String(autoSubmitted).toLowerCase() !== 'no') {
      successfulUids.push(row.uid);
      processed.add(msgId);
      continue;
    }

    const subj = parsed.subject || '';
    if (/^\[PhishingScan Result\]/i.test(subj)) {
      successfulUids.push(row.uid);
      processed.add(msgId);
      continue;
    }

    if (!fromAddr) {
      console.warn('[mail-inbox] no reply address uid=%s', row.uid);
      continue;
    }

    const raw = buildScanRaw(parsed);
    let scanPayload;
    try {
      scanPayload = await postScan(raw);
    } catch (e) {
      console.warn('[mail-inbox] scan API failed uid=%s: %s', row.uid, e.message);
      scanPayload = { ok: false, error: e.message };
    }

    try {
      await sendResultEmail(transporter, fromAddr, subj, scanPayload);
      successfulUids.push(row.uid);
      processed.add(msgId);
    } catch (e) {
      console.warn('[mail-inbox] SMTP reply failed uid=%s: %s', row.uid, e.message);
    }
  }

  await saveProcessedIds(processed);

  if (successfulUids.length) {
    const imap2 = await connectImap();
    await openInbox(imap2);
    for (const uid of successfulUids) {
      try {
        await uidAddSeen(imap2, uid);
      } catch (e) {
        console.warn('[mail-inbox] mark Seen failed uid=%s: %s', uid, e.message);
      }
    }
    await closeImap(imap2);
  }
}

function startMailInboxWorker() {
  const interval = Number(process.env.EMAIL_POLL_MS) || 30000;
  let busy = false;

  async function tick() {
    if (busy) return;
    busy = true;
    try {
      await processInboxRound();
    } catch (e) {
      console.error('[mail-inbox]', e.message || e);
    } finally {
      busy = false;
    }
  }

  console.log(
    `[mail-inbox] worker started; poll every ${interval}ms; scan → ${scanUrl()}`
  );
  tick();
  setInterval(tick, interval);
}

module.exports = { startMailInboxWorker, processInboxRound };
