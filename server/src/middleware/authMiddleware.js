const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

// Middleware to extract user ID if token is provided, but allow guests
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user.id;
  } catch (err) {
    req.userId = null;
  }
  next();
};

// Middleware to require authentication
const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user.id;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: 'Token is not valid' });
  }
};

module.exports = { optionalAuth, requireAuth };
