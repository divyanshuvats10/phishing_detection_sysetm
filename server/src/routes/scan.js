const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');
const fetch = require('node-fetch');
const { checkVirusTotal, checkHIBP } = require('../services/threatIntel');

// Basic endpoint to accept scan requests, call ML microservice when configured, and store a log
router.post('/', async (req, res) => {
  try {
    const { inputType = 'url', raw = '', userId = null } = req.body;

    let result = 'unknown';
    let score = 0;
    const meta = { notes: 'Initial placeholder' };

    if (process.env.ML_SERVICE_URL) {
      try {
        const mlRes = await fetch(process.env.ML_SERVICE_URL.replace(/\/$/, '') + '/analyze', {
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
      meta.notes = 'No ML_SERVICE_URL configured; using local heuristic';
      // simple heuristic fallback
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

    // Threat intelligence integrations (placeholders)
    try {
      if (inputType === 'url' && process.env.VIRUSTOTAL_KEY) {
        const vt = await checkVirusTotal(raw, process.env.VIRUSTOTAL_KEY);
        meta.virusTotal = vt;
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
