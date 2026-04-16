const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { MAX_VT_UPLOAD_BYTES } = require('../constants/vtUploadAllowlist');

const VT_BASE = 'https://www.virustotal.com/api/v3';
const DEFAULT_POLL_MS = 60000;
const POLL_INTERVAL_MS = 2000;

function virusTotalUrlId(urlString) {
  return Buffer.from(urlString, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function vtHeaders(apiKey, extra = {}) {
  return { 'x-apikey': apiKey, ...extra };
}

/**
 * Normalizes VT stats (from analysis or URL/file resource) to:
 * { harmless, malicious, suspicious, undetected, timeout }
 */
function extractStats(attributes) {
  if (!attributes) return null;
  const s = attributes.last_analysis_stats || attributes.stats;
  if (!s || typeof s !== 'object') return null;
  return {
    harmless: s.harmless ?? 0,
    malicious: s.malicious ?? 0,
    suspicious: s.suspicious ?? 0,
    undetected: s.undetected ?? 0,
    timeout: s.timeout ?? 0
  };
}

/**
 * Plain-language interpretation of VT engine counts for non-technical users.
 * @param {ReturnType<typeof extractStats>|null} stats
 */
function summarizeVirusTotalStats(stats) {
  if (!stats || typeof stats !== 'object') return null;
  const harmless = Number(stats.harmless) || 0;
  const malicious = Number(stats.malicious) || 0;
  const suspicious = Number(stats.suspicious) || 0;
  const undetected = Number(stats.undetected) || 0;
  const timeout = Number(stats.timeout) || 0;
  const totalEngines = harmless + malicious + suspicious + undetected + timeout;

  if (totalEngines === 0) {
    return {
      verdict: 'unknown',
      label: 'No engine data',
      shortMessage: 'No security vendor counts were returned for this scan.',
      detail:
        'VirusTotal did not provide per-engine results yet. Open the full VirusTotal report if a link is shown below.'
    };
  }

  if (malicious > 0) {
    return {
      verdict: 'malicious',
      label: 'Flagged as malicious',
      shortMessage: `${malicious} of ${totalEngines} security vendors reported this as malicious.`,
      detail:
        'Treat this as high risk: do not run the file or trust the link unless you are sure of the source. Check the full VirusTotal report for vendor names.'
    };
  }

  if (suspicious > 0) {
    return {
      verdict: 'suspicious',
      label: 'Suspicious — proceed carefully',
      shortMessage: `${suspicious} vendor(s) marked this as suspicious; none reported it as clearly malicious.`,
      detail:
        'This may be a false alarm or an early warning. Only continue if you expected this file or URL and you trust the sender or site.'
    };
  }

  return {
    verdict: 'clean',
    label: 'No malicious or suspicious flags',
    shortMessage: `None of ${totalEngines} security vendors reported this as malicious or suspicious.`,
    detail:
      'That usually means lower risk, but it is not a guarantee—rare or new threats are sometimes missed. Prefer sources you trust.'
  };
}

function userMessageForVirusTotalFailure(vt) {
  if (!vt || vt.ok) return null;
  const r = vt.reason;
  if (r === 'no_api_key') return 'VirusTotal is not configured on the server.';
  if (r === 'timeout') {
    return 'The scan did not finish in time. Wait a minute and scan again, or open the VirusTotal report in your browser if a link is available.';
  }
  if (r === 'analysis_failed') return 'VirusTotal could not complete the analysis for this item.';
  if (r === 'empty_url') return 'No URL was provided for VirusTotal.';
  if (r === 'empty_or_invalid_base64') return 'The file data was missing or invalid.';
  if (r === 'file_too_large') return 'The file is larger than the maximum allowed for scanning.';
  if (r === 'no_analysis_id') return 'VirusTotal did not return an analysis id.';
  if (r === 'unsupported_input_type') return 'This input type is not scanned with VirusTotal.';
  if (typeof vt.status === 'number') {
    return `VirusTotal returned an error (HTTP ${vt.status}).`;
  }
  return 'The VirusTotal check did not complete successfully.';
}

function enrichVirusTotalResult(vt) {
  if (!vt || typeof vt !== 'object') return vt;
  const out = { ...vt };
  if (out.ok && out.stats) {
    out.summary = summarizeVirusTotalStats(out.stats);
  } else if (!out.ok) {
    out.userMessage = userMessageForVirusTotalFailure(out);
  }
  return out;
}

function decodeBase64Attachment(raw) {
  let s = (raw || '').trim();
  const dataUrl = s.match(/^data:([^;]*);base64,(.+)$/is);
  if (dataUrl) s = dataUrl[2].replace(/\s/g, '');
  else s = s.replace(/\s/g, '');
  if (!s) return null;
  try {
    const buf = Buffer.from(s, 'base64');
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

/** Step 2: GET https://www.virustotal.com/api/v3/analyses/{id} */
async function getAnalysis(analysisId, apiKey) {
  const res = await fetch(`${VT_BASE}/analyses/${encodeURIComponent(analysisId)}`, {
    headers: vtHeaders(apiKey)
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

/**
 * Poll until analysis completes (repeated getAnalysis), then return the last response.
 * Response shape when done: json.data.attributes.stats → { malicious, suspicious, undetected, ... }
 */
async function waitForAnalysisReport(analysisId, apiKey, maxWaitMs = DEFAULT_POLL_MS) {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const { ok, status, json } = await getAnalysis(analysisId, apiKey);
    if (!ok) {
      return { ok: false, status, error: json };
    }
    const statusAttr = json.data?.attributes?.status;
    if (statusAttr === 'completed') {
      return { ok: true, analysis: json };
    }
    if (statusAttr === 'failed' || statusAttr === 'error') {
      return { ok: false, reason: 'analysis_failed', analysis: json };
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return { ok: false, reason: 'timeout' };
}

/** Step 1 (file): POST https://www.virustotal.com/api/v3/files — returns analysis id from response.data.id */
async function uploadFileToVirusTotal(buffer, apiKey, filename = 'upload.bin') {
  const safeName = path.basename(filename || 'upload.bin') || 'upload.bin';
  const form = new FormData();
  form.append('file', buffer, { filename: safeName });

  const res = await fetch(`${VT_BASE}/files`, {
    method: 'POST',
    headers: vtHeaders(apiKey, form.getHeaders()),
    body: form
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

/** Step 1 (url): POST https://www.virustotal.com/api/v3/urls — returns analysis id from response.data.id */
async function submitUrlToVirusTotal(urlString, apiKey) {
  const trimmed = (urlString || '').trim();
  if (!trimmed) return { ok: false, reason: 'empty_url', json: {} };

  const params = new URLSearchParams();
  params.append('url', trimmed);
  const res = await fetch(`${VT_BASE}/urls`, {
    method: 'POST',
    headers: vtHeaders(apiKey, { 'Content-Type': 'application/x-www-form-urlencoded' }),
    body: params
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

async function scanVirusTotalUrl(urlString, apiKey) {
  const trimmed = (urlString || '').trim();
  if (!trimmed) return { ok: false, reason: 'empty_url' };

  const urlId = virusTotalUrlId(trimmed);
  const guiUrl = `https://www.virustotal.com/gui/url/${encodeURIComponent(urlId)}/detection`;

  const cached = await fetch(`${VT_BASE}/urls/${encodeURIComponent(urlId)}`, {
    headers: vtHeaders(apiKey)
  });
  const cachedJson = await cached.json().catch(() => ({}));

  if (cached.ok && cachedJson.data?.attributes?.last_analysis_stats) {
    const stats = extractStats(cachedJson.data.attributes);
    return {
      ok: true,
      source: 'existing_report',
      stats,
      urlId,
      permalink: guiUrl,
      lastAnalysisDate: cachedJson.data.attributes.last_analysis_date ?? null
    };
  }

  const submit = await submitUrlToVirusTotal(trimmed, apiKey);
  if (!submit.ok) {
    return {
      ok: false,
      status: submit.status,
      error: submit.json,
      urlId,
      permalink: guiUrl
    };
  }

  const analysisId = submit.json?.data?.id;
  if (!analysisId) {
    return { ok: false, reason: 'no_analysis_id', submit: submit.json, urlId, permalink: guiUrl };
  }

  const polled = await waitForAnalysisReport(analysisId, apiKey);
  if (!polled.ok) {
    return { ...polled, submit: submit.json, analysisId, urlId, permalink: guiUrl };
  }

  const stats = extractStats(polled.analysis?.data?.attributes);
  return {
    ok: true,
    source: 'submitted',
    stats,
    analysisId,
    urlId,
    permalink: guiUrl
  };
}

async function scanVirusTotalFile(raw, apiKey, fileName = '') {
  const buffer = decodeBase64Attachment(raw);
  if (!buffer || buffer.length === 0) {
    return { ok: false, reason: 'empty_or_invalid_base64' };
  }
  if (buffer.length > MAX_VT_UPLOAD_BYTES) {
    return { ok: false, reason: 'file_too_large', maxBytes: MAX_VT_UPLOAD_BYTES };
  }

  const submit = await uploadFileToVirusTotal(buffer, apiKey, fileName);
  if (!submit.ok) {
    return { ok: false, status: submit.status, error: submit.json };
  }

  const submitJson = submit.json;
  const analysisId = submitJson?.data?.id;
  const sha256 = submitJson?.meta?.file_info?.sha256;
  const permalink = sha256
    ? `https://www.virustotal.com/gui/file/${sha256}/detection`
    : null;

  if (!analysisId) {
    return { ok: false, reason: 'no_analysis_id', submit: submitJson, sha256, permalink };
  }

  const polled = await waitForAnalysisReport(analysisId, apiKey);
  if (!polled.ok) {
    return { ...polled, submit: submitJson, analysisId, sha256, permalink };
  }

  const stats = extractStats(polled.analysis?.data?.attributes);
  return {
    ok: true,
    source: 'submitted',
    stats,
    analysisId,
    sha256,
    permalink
  };
}

/**
 * VirusTotal v3 flow for URL and file:
 * - File: POST /files → GET /analyses/{id} (poll until completed) → attributes.stats
 * - URL: optional GET /urls/{url_id} if a report exists; else POST /urls → GET /analyses/{id}
 *
 * @param {'url'|'attachment'} inputType
 * @param {string} raw — URL string, or base64 file (optional data:...;base64, prefix)
 * @param {string} apiKey
 * @param {{ fileName?: string }} [options] — original filename for VT upload
 */
async function checkVirusTotal(inputType, raw, apiKey, options = {}) {
  if (!apiKey) return enrichVirusTotalResult({ ok: false, reason: 'no_api_key' });
  if (inputType === 'url') return enrichVirusTotalResult(await scanVirusTotalUrl(raw, apiKey));
  if (inputType === 'attachment') {
    return enrichVirusTotalResult(await scanVirusTotalFile(raw, apiKey, options.fileName));
  }
  return enrichVirusTotalResult({ ok: false, reason: 'unsupported_input_type' });
}

async function checkHIBP(account, apiKey) {
  if (!apiKey) return { ok: false, reason: 'no_api_key' };
  try {
    const endpoint = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(account)}`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': 'Phishing-Detection-System/1.0'
      }
    });
    if (res.status === 404) return { ok: true, breached: false };
    const json = await res.json();
    return { ok: true, breached: true, breaches: json };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = {
  checkVirusTotal,
  checkHIBP,
  virusTotalUrlId,
  decodeBase64Attachment,
  getAnalysis,
  uploadFileToVirusTotal,
  submitUrlToVirusTotal,
  waitForAnalysisReport,
  extractStats,
  summarizeVirusTotalStats,
  enrichVirusTotalResult
};
