const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');

// Fetch recent scan logs, sorted by newest first
router.get('/', async (req, res) => {
  try {
    const logs = await ScanLog.find()
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 for performance
    
    res.json({ ok: true, logs });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ ok: false, error: 'Server error fetching logs' });
  }
});

module.exports = router;
