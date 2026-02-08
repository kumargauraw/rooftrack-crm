function startReminderChecker(db, bot) {
    console.log('Starting reminder checker (60s interval)');

    setInterval(async () => {
        try {
            // Find due reminders
            const dueReminders = db.prepare(`
                SELECT r.*, l.name as lead_name 
                FROM reminders r
                LEFT JOIN leads l ON r.lead_id = l.id
                WHERE r.sent = 0 
                AND r.remind_at <= datetime('now')
            `).all();

            for (const reminder of dueReminders) {
                try {
                    let message = `⏰ *Reminder*\n\n`;
                    message += `📝 ${reminder.message}\n`;
                    
                    if (reminder.lead_name) {
                        message += `\n👤 *Related Lead:* ${reminder.lead_name}`;
                    }

                    await bot.sendMessage(reminder.user_telegram_id, message, { parse_mode: 'Markdown' });

                    // Mark as sent
                    db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?').run(reminder.id);
                    
                    console.log(`Sent reminder ${reminder.id} to ${reminder.user_telegram_id}`);
                } catch (sendError) {
                    console.error(`Failed to send reminder ${reminder.id}:`, sendError.message);
                }
            }
        } catch (error) {
            console.error('Reminder checker error:', error.message);
        }
    }, 60000); // Every 60 seconds
}

module.exports = { startReminderChecker };
