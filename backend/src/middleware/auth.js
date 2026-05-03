const jwt  = require('jsonwebtoken');
const pool = require('../config/database');

/** Require valid JWT – attaches req.user */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId],
    );
    if (!rows.length)
      return res.status(401).json({ message: 'User not found' });

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
      return res.status(401).json({ message: 'Invalid or expired token' });
    next(err);
  }
};

/** Admin-only gate (must come after authenticate) */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
};

/** Attach user if JWT present, otherwise continue anonymously */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();

    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId],
    );
    if (rows.length) req.user = rows[0];
    next();
  } catch {
    next(); // silently ignore bad token for optional routes
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };
