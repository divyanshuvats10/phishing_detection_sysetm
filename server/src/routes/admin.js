const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ScanLog = require('../models/ScanLog');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// All routes in this file require both authentication and admin role
router.use(requireAuth, requireAdmin);

// Get all users (paginated)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await User.countDocuments();

    res.json({ ok: true, users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }
    // Optionally delete their scan logs too:
    // await ScanLog.deleteMany({ user: req.params.id });
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Get all scan logs (paginated)
router.get('/logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await ScanLog.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await ScanLog.countDocuments();

    res.json({ ok: true, logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin get logs error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Delete a scan log
router.delete('/logs/:id', async (req, res) => {
  try {
    const log = await ScanLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ ok: false, error: 'Log not found' });
    }
    res.json({ ok: true, message: 'Log deleted successfully' });
  } catch (err) {
    console.error('Admin delete log error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
