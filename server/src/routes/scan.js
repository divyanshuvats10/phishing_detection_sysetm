const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');
const fetch = require('node-fetch');
const { checkVirusTotal, checkHIBP, decodeBase64Attachment, enrichVirusTotalResult } = require('../services/threatIntel');
const { validateVtFileUpload } = require('../constants/vtUploadAllowlist');

const { optionalAuth } = require('../middleware/authMiddleware');

// Basic endpoint to accept scan requests, call ML microservice when configured, and store a log
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      inputType = 'url',
      raw = '',
      guestSessionId = null,
      fileName = '',
      fileMime = ''
    } = req.body;
    const userId = req.userId || null;

    if (inputType === 'attachment') {
      const buf = decodeBase64Attachment(raw);
      if (!buf) {
        return res.status(400).json({
          ok: false,
          error: 'Invalid or empty file. Choose a file using the upload control.'
        });
      }
      const vtType = validateVtFileUpload(fileName, buf.length, fileMime);
      if (!vtType.ok) {
        return res.status(400).json({ ok: false, error: vtType.error });
      }
    }

    let result = 'unknown';
    let score = 0;
    const meta = { notes: 'Initial placeholder' };

    const mlBase = process.env.ML_SERVICE_URL && process.env.ML_SERVICE_URL.replace(/\/$/, '');
    const useMlForInput = Boolean(mlBase && (inputType === 'email' || inputType === 'url'));

    if (useMlForInput) {
      try {
        const mlRes = await fetch(`${mlBase}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputType, raw })
        });
        const mlJson = await mlRes.json();
        if (mlJson) {
          result = mlJson.classification || 'unknown';
          score = typeof mlJson.score === 'number' ? mlJson.score : 0;
          meta.ml = mlJson;
        }
      } catch (mlErr) {
        console.warn('ML service call failed:', mlErr.message);
        meta.mlError = mlErr.message;
      }
    } else {
      if (inputType === 'attachment') {
        meta.notes =
          'ML runs for email and URL only; attachments use VirusTotal (if configured) and stored metadata.';
        result = 'unknown';
        score = 0;
      } else {
        meta.notes = mlBase
          ? 'ML runs for email and URL only; using local heuristic for text.'
          : 'No ML_SERVICE_URL configured; using local heuristic';
        const lowered = (raw || '').toLowerCase();
        if (lowered.includes('login') || lowered.includes('verify') || lowered.includes('account') || lowered.includes('password') || lowered.includes('confirm')) {
          result = 'phishing';
          score = 75;
        } else if (lowered.includes('http') || lowered.includes('https')) {
          result = 'unknown';
          score = 40;
        } else {
          result = 'legitimate';
          score = 10;
        }
      }
    }

    try {
      const vtKey = process.env.VIRUSTOTAL_KEY && String(process.env.VIRUSTOTAL_KEY).trim();
      if ((inputType === 'url' || inputType === 'attachment') && vtKey) {
        const vt = await checkVirusTotal(inputType, raw, vtKey, {
          fileName: inputType === 'attachment' ? fileName : undefined
        });
        meta.virusTotal = vt;
        if (vt.ok && vt.stats) {
          if (vt.stats.malicious > 0) {
            score = Math.max(score, 85);
            if (result === 'legitimate') result = 'unknown';
          } else if (vt.stats.suspicious > 2) {
            score = Math.max(score, 55);
          }
        }
      } else if (inputType === 'url' || inputType === 'attachment') {
        meta.virusTotal = enrichVirusTotalResult({
          ok: false,
          reason: 'no_api_key',
          hint: 'Set VIRUSTOTAL_KEY in server/.env and restart the Node server'
        });
      }

      if (inputType === 'email' && process.env.HIBP_API_KEY) {
        const hibp = await checkHIBP(raw, process.env.HIBP_API_KEY);
        meta.hibp = hibp;
      }
    } catch (intelErr) {
      console.warn('Threat intel check failed:', intelErr.message || intelErr);
    }

    const log = new ScanLog({
      user: userId,
      guestSessionId: !userId ? guestSessionId : null,
      inputType,
      raw,
      result,
      riskScore: score,
      meta
    });

    try {
      await log.save();
    } catch (saveErr) {
      // If DB not available during tests or dev, attach save error but continue
      meta.saveError = saveErr.message;
    }

    res.json({ ok: true, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
