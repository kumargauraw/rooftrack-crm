const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const crypto = require('crypto');

router.post('/', authenticate, (req, res) => {
    const { lead_id, type, summary, direction } = req.body;
    const db = getDb();
    const id = crypto.randomUUID();

    try {
        db.prepare(`
            INSERT INTO interactions (id, lead_id, type, summary, direction, logged_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, lead_id, type, summary, direction || 'internal', req.user.username);

        res.json({ success: true, data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to log interaction' });
    }
});

module.exports = router;
