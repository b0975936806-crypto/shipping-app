const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'shipments.db');
const db = new Database(dbPath);

db.exec(`
    CREATE TABLE IF NOT EXISTS order_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderNo TEXT NOT NULL,
        imagePath TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        can_create INTEGER DEFAULT 1,
        can_edit INTEGER DEFAULT 1,
        can_delete INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

/**
 * Get all shipments sorted by orderNo descending
 */
function getAllShipments() {
    return db.prepare('SELECT * FROM orders ORDER BY orderNo DESC').all();
}

/**
 * Add an image to an order
 */
function addOrderImage(orderNo, imagePath) {
    return db.prepare('INSERT INTO order_images (orderNo, imagePath) VALUES (?, ?)').run(orderNo, imagePath);
}

/**
 * Get all images for an order
 */
function getOrderImages(orderNo) {
    return db.prepare('SELECT * FROM order_images WHERE orderNo = ? ORDER BY id ASC').all(orderNo);
}

/**
 * Get image count for an order
 */
function getOrderImageCount(orderNo) {
    const result = db.prepare('SELECT COUNT(*) as count FROM order_images WHERE orderNo = ?').get(orderNo);
    return result ? result.count : 0;
}

/**
 * Delete an image by id
 */
function deleteOrderImage(id) {
    return db.prepare('DELETE FROM order_images WHERE id = ?').run(id);
}

module.exports = {
    db,
    getAllShipments,
    addOrderImage,
    getOrderImages,
    getOrderImageCount,
    deleteOrderImage
};
