const express = require('express');
const router = express.Router();
const dbManager = require('./data/manager');

router.get('/', (req, res) => {
    try {
        const all = dbManager.getAllShipments();
        const now = new Date();
        const stats = { today: 0, week: 0, month: 0, year: 0 };
        
        all.forEach(s => {
            if (!s.date) return;
            
            const date = new Date(s.date);
            const todayStr = now.toISOString().split('T')[0];
            const itemDateStr = date.toISOString().split('T')[0];
            
            if (itemDateStr === todayStr) stats.today++;
            
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            if (date >= oneWeekAgo) stats.week++;
            
            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) stats.month++;
            if (date.getFullYear() === now.getFullYear()) stats.year++;
        });
        
        res.json(stats);
    } catch (e) {
        console.error('GET /api/stats error:', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
