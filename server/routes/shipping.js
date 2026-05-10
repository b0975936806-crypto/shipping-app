const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db, addOrderImage, getOrderImageCount } = require('../data/manager');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(file.originalname);
        const orderNo = req.params.orderNo || 'temp';
        cb(null, `${orderNo}_${timestamp}_${random}${ext}`);
    }
});

const upload = multer({ storage });

router.get('/', (req, res) => {
    try {
        const { start_date, end_date, customer } = req.query;
        const today = new Date().toISOString().split('T')[0];
        const s = start_date || today;
        const e = end_date || today;
        
        let sql = "SELECT * FROM orders WHERE date >= ? AND date <= ?";
        const params = [s, e];
        
        if (customer) {
            sql += " AND customerName LIKE ?";
            params.push('%' + customer + '%');
        }
        
        const orders = db.prepare(sql + " ORDER BY orderNo DESC LIMIT 50").all(params);
        res.json(orders);
    } catch (e) {
        console.error('GET /api/shipping error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.post('/', upload.any(), (req, res) => {
    try {
        const { date, date2, customerName, totalQty, status, memo } = req.body;
        
        if (!date || !customerName) {
            return res.status(400).json({ error: 'date and customerName are required' });
        }
        
        const prefix = date.replace(/-/g, '').slice(2);
        const last = db.prepare("SELECT orderNo FROM orders WHERE orderNo LIKE ? ORDER BY orderNo DESC LIMIT 1").get(prefix + '-%');
        const seq = last ? parseInt(last.orderNo.split('-')[1]) + 1 : 1;
        const orderNo = `${prefix}-${seq.toString().padStart(3, '0')}`;
        
        const stmt = db.prepare(`
            INSERT INTO orders (orderNo, date, date2, customerName, totalQty, totalBoxes, status, memo, imageqt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(orderNo, date, date2 || null, customerName, totalQty || 0, 0, status || 'draft', memo || '', 0);
        
        res.json({ success: true, orderNo });
    } catch (e) {
        console.error('POST /api/shipping error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.post('/:orderNo/images', upload.any(), (req, res) => {
    try {
        const { orderNo } = req.params;
        const uploadedImages = req.files || [];
        
        uploadedImages.forEach(file => {
            addOrderImage(orderNo, file.filename);
        });
        
        const imageCount = getOrderImageCount(orderNo);
        db.prepare('UPDATE orders SET imageqt = ? WHERE orderNo = ?').run(imageCount, orderNo);
        
        res.json({ success: true, count: uploadedImages.length, imageqt: imageCount });
    } catch (e) {
        console.error('POST /api/shipping/images error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/:orderNo/images', (req, res) => {
    try {
        const { orderNo } = req.params;
        const images = db.prepare('SELECT * FROM order_images WHERE orderNo = ? ORDER BY id ASC').all(orderNo);
        res.json(images);
    } catch (e) {
        console.error('GET /api/shipping/images error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.get('/:orderNo', (req, res) => {
    try {
        const { orderNo } = req.params;
        const order = db.prepare('SELECT * FROM orders WHERE orderNo = ?').get(orderNo);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const images = db.prepare('SELECT * FROM order_images WHERE orderNo = ? ORDER BY id ASC').all(orderNo);
        res.json({ ...order, images });
    } catch (e) {
        console.error('GET /api/shipping/:orderNo error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.put('/:orderNo', (req, res) => {
    try {
        const { orderNo } = req.params;
        const { totalQty, memo, date2 } = req.body;
        
        const order = db.prepare('SELECT * FROM orders WHERE orderNo = ?').get(orderNo);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        db.prepare('UPDATE orders SET totalQty = ?, memo = ?, date2 = ? WHERE orderNo = ?')
            .run(totalQty || order.totalQty, memo || order.memo, date2 || order.date2, orderNo);
        
        res.json({ success: true });
    } catch (e) {
        console.error('PUT /api/shipping/:orderNo error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.delete('/:orderNo/images/:imageId', (req, res) => {
    try {
        const { orderNo, imageId } = req.params;
        
        const image = db.prepare('SELECT * FROM order_images WHERE id = ? AND orderNo = ?').get(imageId, orderNo);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const imagePath = path.join(uploadDir, image.imagePath);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        db.prepare('DELETE FROM order_images WHERE id = ?').run(imageId);
        
        const imageCount = getOrderImageCount(orderNo);
        db.prepare('UPDATE orders SET imageqt = ? WHERE orderNo = ?').run(imageCount, orderNo);
        
        res.json({ success: true, imageqt: imageCount });
    } catch (e) {
        console.error('DELETE /api/shipping/images error:', e);
        res.status(500).json({ error: e.message });
    }
});

router.delete('/:orderNo', (req, res) => {
    try {
        const { orderNo } = req.params;
        
        const order = db.prepare('SELECT * FROM orders WHERE orderNo = ?').get(orderNo);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        db.prepare('DELETE FROM order_images WHERE orderNo = ?').run(orderNo);
        db.prepare('DELETE FROM orders WHERE orderNo = ?').run(orderNo);
        
        res.json({ success: true });
    } catch (e) {
        console.error('DELETE /api/shipping/:orderNo error:', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;