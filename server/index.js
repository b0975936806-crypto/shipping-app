require('dotenv').config({ path: '../.env' });
const express = require('express');
const multer = require('multer');
const path = require('path');
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

const verifyLineToken = (req, res, next) => {
  if (process.env.SKIP_LINE_AUTH === 'true') {
    return next();
  }

  if (req.method === 'GET' || req.path.includes('/images')) {
    return next();
  }
  const token = req.headers['x-line-channel-secret'];
  if (!token || token !== process.env.CHANNEL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api/shipping', verifyLineToken, require('./routes/shipping'));
app.use('/api/stats', require('./stats'));

app.listen(3020, () => console.log('Server running on 3020'));
app.get('/api/test', (req, res) => res.send("API IS WORKING"));
