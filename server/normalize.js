const Database = require('better-sqlite3');
const db = new Database('/home/yu/projects/shipping-app/server/data/shipments.db');

const rows = db.prepare('SELECT id, date, date2 FROM orders').all();
const update = db.prepare('UPDATE orders SET date = ?, date2 = ? WHERE id = ?');

rows.forEach(r => {
    const norm = (d) => {
        if (!d || d.includes('-')) return d;
        return '20' + d.substring(0,2) + '-' + d.substring(2,4) + '-' + d.substring(4,6);
    };
    if (r.date.length === 6 || (r.date2 && r.date2.length === 6)) {
        update.run(norm(r.date), norm(r.date2), r.id);
    }
});
console.log('Database normalized to YYYY-MM-DD format.');
