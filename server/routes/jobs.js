const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const crypto = require('crypto');

// Get all jobs
router.get('/', authenticate, (req, res) => {
    const db = getDb();
    const jobs = db.prepare(`
        SELECT j.*, l.name as lead_name 
        FROM jobs j
        JOIN leads l ON j.lead_id = l.id
        ORDER BY j.created_at DESC
    `).all();
    res.json({ success: true, data: jobs });
});

// Create Job (from Lead)
router.post('/', authenticate, (req, res) => {
    const { lead_id, job_type, description, quote_amount } = req.body;
    const db = getDb();
    const id = crypto.randomUUID();

    try {
        db.prepare(`
            INSERT INTO jobs (id, lead_id, job_type, description, status, quote_amount, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?, datetime('now'))
        `).run(id, lead_id, job_type, description, quote_amount);

        // Update lead status
        db.prepare("UPDATE leads SET status = 'accepted' WHERE id = ?").run(lead_id);

        res.json({ success: true, data: { id } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create job' });
    }
});

module.exports = router;
