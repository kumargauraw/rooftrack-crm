const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const authenticate = require('../middleware/auth');

router.get('/summary', authenticate, (req, res) => {
    const db = getDb();

    try {
        // 1. Stats Cards
        const newLeads = db.prepare("SELECT count(*) as count FROM leads WHERE created_at > datetime('now', '-7 days')").get();
        const appointmentsToday = db.prepare("SELECT count(*) as count FROM appointments WHERE date(scheduled_date) = date('now')").get();
        const activeJobs = db.prepare("SELECT count(*) as count FROM jobs WHERE status IN ('pending', 'in_progress')").get();

        // Revenue logic (sum of paid jobs this month)
        const revenueThisMonth = db.prepare(`
      SELECT sum(final_amount) as total 
      FROM jobs 
      WHERE payment_status = 'paid' 
      AND strftime('%Y-%m', updated_at) = strftime('%Y-%m', 'now')
    `).get();

        const revenueLastMonth = db.prepare(`
      SELECT sum(final_amount) as total 
      FROM jobs 
      WHERE payment_status = 'paid' 
      AND strftime('%Y-%m', updated_at) = strftime('%Y-%m', 'now', '-1 month')
    `).get();

        // 2. Pipeline breakdown
        const pipelineData = db.prepare("SELECT status, count(*) as count FROM leads GROUP BY status").all();
        const leadsByStatus = pipelineData.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        // 3. Sources breakdown
        const sourceData = db.prepare("SELECT source_channel, count(*) as count FROM leads GROUP BY source_channel").all();
        const leadsBySource = sourceData.reduce((acc, row) => {
            acc[row.source_channel] = row.count;
            return acc;
        }, {});

        // 4. Revenue Trend (Last 6 months)
        const revenueTrend = db.prepare(`
        SELECT strftime('%Y-%m', updated_at) as month, sum(final_amount) as revenue
        FROM jobs
        WHERE payment_status = 'paid'
        AND updated_at > datetime('now', '-6 months')
        GROUP BY month
        ORDER BY month ASC
    `).all();

        // 5. Recent Activity
        const recentActivity = db.prepare(`
        SELECT i.id, i.type, i.summary, l.name as leadName, i.created_at as createdAt
        FROM interactions i
        JOIN leads l ON i.lead_id = l.id
        ORDER BY i.created_at DESC
        LIMIT 10
    `).all();

        res.json({
            success: true,
            data: {
                newLeadsThisWeek: newLeads.count,
                appointmentsToday: appointmentsToday.count,
                activeJobs: activeJobs.count,
                revenueThisMonth: revenueThisMonth.total || 0,
                revenueLastMonth: revenueLastMonth.total || 0,
                leadsByStatus,
                leadsBySource,
                revenueByMonth: revenueTrend,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
    }
});

module.exports = router;
