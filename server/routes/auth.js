const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const db = getDb();

    // Simple plain text password check for MVP (as requested)
    // In production, use bcrypt!
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || user.password_hash !== password) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24h
    });

    res.json({
        success: true,
        data: { user: { id: user.id, name: user.name, role: user.role } }
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

router.get('/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ success: false });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ success: true, data: decoded });
    } catch (e) {
        res.json({ success: false });
    }
});

module.exports = router;
