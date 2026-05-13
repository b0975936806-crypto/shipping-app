const jwt = require('jsonwebtoken');
const { db } = require('../data/manager');

const JWT_SECRET = process.env.JWT_SECRET || 'shipping-app-secret-key-2024';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // 從 DB 拿最新權限
    const user = db.prepare(
      'SELECT id, username, role, can_create, can_edit, can_delete FROM users WHERE id = ?'
    ).get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate, JWT_SECRET };
