const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');

const { optionalAuth } = require('../middleware/authMiddleware');

// Fetch recent scan logs, sorted by newest first
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { guestSessionId } = req.query;
    let query = {};
    if (req.userId) {
      query.user = req.userId;
    } else if (guestSessionId) {
      query.guestSessionId = guestSessionId;
    } else {
      // If no user and no guestSessionId, return empty or something?
      // Let's just return what they asked for, or maybe return empty array to be safe
      return res.json({ ok: true, logs: [] });
    }

    const logs = await ScanLog.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 for performance
    
    res.json({ ok: true, logs });
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ ok: false, error: 'Server error fetching logs' });
  }
});

module.exports = router;
