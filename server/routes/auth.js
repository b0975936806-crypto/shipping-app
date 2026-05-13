const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { db } = require('../data/manager');

// GET /api/auth/users — 取得所有用戶（不含密碼）
router.get('/users', require('../middleware/auth').authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const users = db.prepare('SELECT id, username, role, can_create, can_edit, can_delete, created_at FROM users').all();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/users — 新增用戶
router.post('/users', require('../middleware/auth').authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { username, password, role, can_create, can_edit, can_delete } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }
    const hash = bcrypt.hashSync(password, 10);
    db.prepare(`
      INSERT INTO users (username, password, role, can_create, can_edit, can_delete)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, hash, role || 'user', can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0);
    res.json({ success: true });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auth/users/:id — 更新用戶
router.put('/users/:id', require('../middleware/auth').authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { id } = req.params;
    const { username, password, role, can_create, can_edit, can_delete } = req.body;

    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      db.prepare('UPDATE users SET username = ?, password = ?, role = ?, can_create = ?, can_edit = ?, can_delete = ? WHERE id = ?')
        .run(username, hash, role, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0, id);
    } else {
      db.prepare('UPDATE users SET username = ?, role = ?, can_create = ?, can_edit = ?, can_delete = ? WHERE id = ?')
        .run(username, role, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0, id);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/auth/users/:id — 刪除用戶
router.delete('/users/:id', require('../middleware/auth').authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role,
              can_create: user.can_create, can_edit: user.can_edit, can_delete: user.can_delete }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me — 從 DB 拿最新資料（不用 JWT payload）
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, username, role, can_create, can_edit, can_delete, created_at FROM users WHERE id = ?'
    ).get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
