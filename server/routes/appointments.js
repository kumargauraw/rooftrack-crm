const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const crypto = require('crypto');

// Get appointments (can filter by date range later)
router.get('/', authenticate, (req, res) => {
    const db = getDb();
    const appointments = db.prepare(`
        SELECT a.*, l.name as lead_name, l.phone as lead_phone 
        FROM appointments a
        JOIN leads l ON a.lead_id = l.id
        ORDER BY scheduled_date DESC
    `).all();
    res.json({ success: true, data: appointments });
});

// Create appointment
router.post('/', authenticate, (req, res) => {
    const { lead_id, type, scheduled_date, scheduled_time, notes, address } = req.body;
    const db = getDb();
    const id = crypto.randomUUID();

    try {
        db.prepare(`
            INSERT INTO appointments (id, lead_id, type, scheduled_date, scheduled_time, notes, address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, lead_id, type, scheduled_date, scheduled_time, notes, address);

        // Also log interaction
        db.prepare(`
            INSERT INTO interactions (id, lead_id, type, summary) VALUES (?, ?, 'system', ?)
        `).run(crypto.randomUUID(), lead_id, `Scheduled ${type} for ${scheduled_date}`);

        // Update lead status if new
        db.prepare("UPDATE leads SET status = 'scheduled' WHERE id = ? AND status = 'new'").run(lead_id);

        res.json({ success: true, data: { id } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to create appointment' });
    }
});

module.exports = router;
