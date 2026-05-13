require('dotenv').config({ path: '../.env' });
const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filePath);
});

const upload = multer({ storage: multer.memoryStorage() });

// 確保 auth middleware 有引入
const { authenticate } = require('./middleware/auth');

// verifyLineToken 已停用，改用 JWT authenticate
const verifyLineToken = (req, res, next) => {
  return res.status(401).json({ error: 'LINE token auth is deprecated' });
};

// 確保預設 admin 帳號存在
function ensureDefaultUser() {
  const { db } = require('./data/manager');
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('ring');
  if (!existing) {
    const hash = bcrypt.hashSync('23289323', 10);
    db.prepare(`
      INSERT INTO users (username, password, role, can_create, can_edit, can_delete)
      VALUES (?, ?, 'admin', 1, 1, 1)
    `).run('ring', hash);
    console.log('Default admin user "ring" created');
  }
}

app.use('/api/shipping', authenticate, require('./routes/shipping'));
app.use('/api/stats', require('./stats'));
app.use('/api/auth', require('./routes/auth'));

app.listen(3020, () => {
  console.log('Server running on 3020');
  ensureDefaultUser();
});
app.get('/api/test', (req, res) => res.send("API IS WORKING"));
