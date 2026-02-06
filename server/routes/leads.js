const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticate = require('../middleware/auth');
const crypto = require('crypto');

// GET all leads (with filters)
router.get('/', authenticate, (req, res) => {
    const db = getDb();
    // Basic implementation - can add filters later
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    res.json({ success: true, data: leads });
});

// GET single lead details
router.get('/:id', authenticate, (req, res) => {
    const db = getDb();
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);

    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

    // Fetch related data
    const interactions = db.prepare('SELECT * FROM interactions WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);
    const appointments = db.prepare('SELECT * FROM appointments WHERE lead_id = ? ORDER BY scheduled_date DESC').all(req.params.id);
    const jobs = db.prepare('SELECT * FROM jobs WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.id);

    res.json({
        success: true,
        data: { ...lead, interactions, appointments, jobs }
    });
});

// POST create lead
router.post('/', authenticate, (req, res) => {
    const db = getDb();
    const { name, phone, email, address, source_channel, notes } = req.body;
    const id = crypto.randomUUID();

    try {
        const stmt = db.prepare(`
      INSERT INTO leads (id, name, email, phone, address, source_channel, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, name, email, phone, address, source_channel || 'manual', notes);

        // Log creation interaction
        db.prepare(`
        INSERT INTO interactions (id, lead_id, type, summary) VALUES (?, ?, 'system', 'Lead created manually')
    `).run(crypto.randomUUID(), id);

        res.json({ success: true, data: { id, message: 'Lead created' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to create lead' });
    }
});

// PATCH update lead status
router.patch('/:id/status', authenticate, (req, res) => {
    const db = getDb();
    const { status } = req.body;

    try {
        db.prepare('UPDATE leads SET status = ?, updated_at = datetime("now") WHERE id = ?').run(status, req.params.id);

        // Log status change
        db.prepare(`
            INSERT INTO interactions (id, lead_id, type, summary) VALUES (?, ?, 'system', ?)
        `).run(crypto.randomUUID(), req.params.id, `Status changed to ${status}`);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Update failed' });
    }
});

module.exports = router;
