const crypto = require('crypto');

// Generate UUID
function uuid() {
    return crypto.randomUUID();
}

// Format phone number consistently
function formatPhone(phone) {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
}

// Find lead by name or phone
function findLead(db, nameOrPhone) {
    if (!nameOrPhone) return null;
    
    const query = `
        SELECT * FROM leads 
        WHERE deleted_at IS NULL 
        AND (LOWER(name) LIKE ? OR phone LIKE ?)
        ORDER BY created_at DESC
        LIMIT 1
    `;
    const searchTerm = `%${nameOrPhone.toLowerCase()}%`;
    return db.prepare(query).get(searchTerm, `%${nameOrPhone}%`);
}

// Log interaction
function logInteraction(db, leadId, type, summary, loggedBy = 'telegram_bot') {
    const stmt = db.prepare(`
        INSERT INTO interactions (id, lead_id, type, direction, summary, logged_by, created_at)
        VALUES (?, ?, ?, 'internal', ?, ?, datetime('now'))
    `);
    stmt.run(uuid(), leadId, type, summary, loggedBy);
}

// Status emoji mapping
const STATUS_EMOJI = {
    new: '🆕',
    contacted: '📞',
    scheduled: '📅',
    inspected: '🔍',
    quoted: '💰',
    accepted: '✅',
    in_progress: '🔨',
    completed: '🏠',
    paid: '💵',
    lost: '❌'
};

const PRIORITY_EMOJI = {
    hot: '🔥',
    warm: '🌡️',
    cold: '❄️'
};

async function handleNewLead(db, bot, chatId, parsed) {
    if (!parsed.name) {
        await bot.sendMessage(chatId, '⚠️ Could not create lead: Name is required.');
        return;
    }

    const leadId = uuid();
    const stmt = db.prepare(`
        INSERT INTO leads (id, name, phone, email, address, city, state, zip, source_channel, priority, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
        leadId,
        parsed.name,
        formatPhone(parsed.phone),
        parsed.email || null,
        parsed.address || null,
        parsed.city || 'Irving',
        parsed.state || 'TX',
        parsed.zip || null,
        parsed.source || 'telegram',
        parsed.priority || 'warm',
        parsed.notes || parsed.issue || null
    );

    logInteraction(db, leadId, 'system', `Lead created via Telegram: ${parsed.name}`);

    const priorityEmoji = PRIORITY_EMOJI[parsed.priority] || '🌡️';
    
    let message = `✅ *Lead Created!*\n\n`;
    message += `👤 *Name:* ${parsed.name}\n`;
    if (parsed.phone) message += `📱 *Phone:* ${formatPhone(parsed.phone)}\n`;
    if (parsed.email) message += `📧 *Email:* ${parsed.email}\n`;
    if (parsed.address) message += `📍 *Address:* ${parsed.address}\n`;
    if (parsed.city || parsed.state) message += `🏙️ *Location:* ${parsed.city || 'Irving'}, ${parsed.state || 'TX'}\n`;
    message += `${priorityEmoji} *Priority:* ${parsed.priority || 'warm'}\n`;
    if (parsed.source) message += `📣 *Source:* ${parsed.source}\n`;
    if (parsed.notes || parsed.issue) message += `📝 *Notes:* ${parsed.notes || parsed.issue}\n`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleUpdateLead(db, bot, chatId, parsed) {
    const lead = findLead(db, parsed.lead_name_reference || parsed.name || parsed.phone);
    
    if (!lead) {
        await bot.sendMessage(chatId, '⚠️ Could not find a lead matching that name or phone number.');
        return;
    }

    const updates = [];
    const params = [];

    if (parsed.name && parsed.name !== lead.name) { updates.push('name = ?'); params.push(parsed.name); }
    if (parsed.phone) { updates.push('phone = ?'); params.push(formatPhone(parsed.phone)); }
    if (parsed.email) { updates.push('email = ?'); params.push(parsed.email); }
    if (parsed.address) { updates.push('address = ?'); params.push(parsed.address); }
    if (parsed.city) { updates.push('city = ?'); params.push(parsed.city); }
    if (parsed.state) { updates.push('state = ?'); params.push(parsed.state); }
    if (parsed.zip) { updates.push('zip = ?'); params.push(parsed.zip); }
    if (parsed.status) { updates.push('status = ?'); params.push(parsed.status); }
    if (parsed.priority) { updates.push('priority = ?'); params.push(parsed.priority); }
    if (parsed.notes) { updates.push('notes = ?'); params.push(parsed.notes); }

    if (updates.length === 0) {
        await bot.sendMessage(chatId, '⚠️ No fields to update were found in your message.');
        return;
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(lead.id);

    const stmt = db.prepare(`UPDATE leads SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    logInteraction(db, lead.id, 'note', `Lead updated via Telegram: ${updates.length} field(s) changed`);

    await bot.sendMessage(chatId, `✅ *Lead Updated!*\n\n👤 ${lead.name}\n📝 Updated ${updates.length - 1} field(s)`, { parse_mode: 'Markdown' });
}

async function handleSearchLead(db, bot, chatId, query) {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const leads = db.prepare(`
        SELECT * FROM leads 
        WHERE deleted_at IS NULL 
        AND (LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(address) LIKE ?)
        ORDER BY created_at DESC
        LIMIT 10
    `).all(searchTerm, `%${query}%`, searchTerm);

    if (leads.length === 0) {
        await bot.sendMessage(chatId, `🔍 No leads found matching "${query}"`);
        return;
    }

    let message = `🔍 *Found ${leads.length} lead(s):*\n\n`;
    
    for (const lead of leads) {
        const statusEmoji = STATUS_EMOJI[lead.status] || '📋';
        const priorityEmoji = PRIORITY_EMOJI[lead.priority] || '';
        message += `${statusEmoji} *${lead.name}*${priorityEmoji}\n`;
        if (lead.phone) message += `   📱 ${lead.phone}\n`;
        if (lead.address) message += `   📍 ${lead.address}\n`;
        message += `   Status: ${lead.status}\n\n`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleAddAppointment(db, bot, chatId, parsed) {
    const lead = findLead(db, parsed.lead_name_reference || parsed.name);
    
    if (!lead) {
        await bot.sendMessage(chatId, '⚠️ Could not find a lead matching that name. Please specify the customer name.');
        return;
    }

    if (!parsed.appointment_date) {
        await bot.sendMessage(chatId, '⚠️ Please specify a date for the appointment.');
        return;
    }

    const appointmentId = uuid();
    const stmt = db.prepare(`
        INSERT INTO appointments (id, lead_id, type, scheduled_date, scheduled_time, address, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
        appointmentId,
        lead.id,
        parsed.appointment_type || 'inspection',
        parsed.appointment_date,
        parsed.appointment_time || null,
        lead.address,
        parsed.notes || null
    );

    // Update lead status to scheduled if currently new or contacted
    if (lead.status === 'new' || lead.status === 'contacted') {
        db.prepare('UPDATE leads SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run('scheduled', lead.id);
    }

    logInteraction(db, lead.id, 'appointment', `${parsed.appointment_type || 'Inspection'} scheduled for ${parsed.appointment_date}`);

    let message = `📅 *Appointment Scheduled!*\n\n`;
    message += `👤 *Customer:* ${lead.name}\n`;
    message += `📆 *Date:* ${parsed.appointment_date}\n`;
    if (parsed.appointment_time) message += `🕐 *Time:* ${parsed.appointment_time}\n`;
    message += `📋 *Type:* ${parsed.appointment_type || 'inspection'}\n`;
    if (lead.address) message += `📍 *Address:* ${lead.address}\n`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleStatusCheck(db, bot, chatId) {
    const counts = db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM leads 
        WHERE deleted_at IS NULL 
        GROUP BY status
    `).all();

    const countMap = {};
    let total = 0;
    for (const row of counts) {
        countMap[row.status] = row.count;
        total += row.count;
    }

    let message = `📊 *Pipeline Status*\n\n`;
    message += `📈 *Total Leads:* ${total}\n\n`;

    const statuses = ['new', 'contacted', 'scheduled', 'inspected', 'quoted', 'accepted', 'in_progress', 'completed', 'paid', 'lost'];
    
    for (const status of statuses) {
        const count = countMap[status] || 0;
        if (count > 0) {
            const emoji = STATUS_EMOJI[status];
            message += `${emoji} ${status}: ${count}\n`;
        }
    }

    // Add today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = db.prepare(`
        SELECT COUNT(*) as count FROM appointments 
        WHERE scheduled_date = ? AND status = 'scheduled'
    `).get(today);

    if (todayAppts.count > 0) {
        message += `\n📅 *Today's Appointments:* ${todayAppts.count}`;
    }

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleAddNote(db, bot, chatId, parsed) {
    const lead = findLead(db, parsed.lead_name_reference || parsed.name);
    
    if (!lead) {
        await bot.sendMessage(chatId, '⚠️ Could not find a lead matching that name. Please specify the customer name.');
        return;
    }

    if (!parsed.notes) {
        await bot.sendMessage(chatId, '⚠️ No note content found in your message.');
        return;
    }

    logInteraction(db, lead.id, 'note', parsed.notes);

    await bot.sendMessage(chatId, `📝 *Note Added!*\n\n👤 *Lead:* ${lead.name}\n📝 *Note:* ${parsed.notes}`, { parse_mode: 'Markdown' });
}

async function handleSetReminder(db, bot, chatId, telegramId, parsed) {
    if (!parsed.reminder_date || !parsed.reminder_text) {
        await bot.sendMessage(chatId, '⚠️ Please specify a date and message for the reminder.');
        return;
    }

    const reminderId = uuid();
    let leadId = null;

    if (parsed.lead_name_reference) {
        const lead = findLead(db, parsed.lead_name_reference);
        if (lead) leadId = lead.id;
    }

    // Combine date and time for remind_at
    const remindTime = parsed.reminder_time || '09:00';
    const remindAt = `${parsed.reminder_date} ${remindTime}:00`;

    const stmt = db.prepare(`
        INSERT INTO reminders (id, user_telegram_id, lead_id, remind_at, message, sent, created_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `);

    stmt.run(reminderId, telegramId.toString(), leadId, remindAt, parsed.reminder_text);

    let message = `⏰ *Reminder Set!*\n\n`;
    message += `📆 *When:* ${parsed.reminder_date} at ${remindTime}\n`;
    message += `📝 *Message:* ${parsed.reminder_text}\n`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

module.exports = {
    handleNewLead,
    handleUpdateLead,
    handleSearchLead,
    handleAddAppointment,
    handleStatusCheck,
    handleAddNote,
    handleSetReminder
};
