-- Users
INSERT INTO users (id, username, password_hash, name, role) VALUES 
('u1', 'dennis', 'password123', 'Dennis', 'admin'),
('u2', 'kumar', 'password123', 'Kumar', 'admin');

-- Storm Events
INSERT INTO storm_events (id, date, type, severity, affected_areas, leads_generated, notes) VALUES
('storm1', '2026-01-15', 'Hail', 'high', '["Irving", "Coppell"]', 12, 'Golf ball sized hail reported'),
('storm2', '2025-11-20', 'Wind', 'moderate', '["Plano", "Frisco"]', 8, 'High winds damaging shingles');

-- Leads
INSERT INTO leads (id, name, email, phone, address, city, state, zip, source_channel, status, priority, storm_event_id, estimated_value, assigned_to, created_at) VALUES
('l1', 'John Smith', 'john.smith@example.com', '972-555-0101', '123 Maple St', 'Irving', 'TX', '75038', 'stormwatch', 'new', 'hot', 'storm1', 15000, 'Dennis', datetime('now', '-2 days')),
('l2', 'Sarah Jones', 'sarah.j@example.com', '214-555-0102', '456 Oak Ave', 'Coppell', 'TX', '75019', 'referral', 'contacted', 'warm', NULL, 12000, 'Dennis', datetime('now', '-5 days')),
('l3', 'Mike Brown', 'mike.b@example.com', '469-555-0103', '789 Pine Ln', 'Plano', 'TX', '75024', 'homeadvisor', 'scheduled', 'warm', NULL, 8000, 'Dennis', datetime('now', '-10 days')),
('l4', 'Emily White', 'emily.w@example.com', '972-555-0104', '321 Elm St', 'Frisco', 'TX', '75034', 'yelp', 'quoted', 'hot', 'storm2', 18000, 'Dennis', datetime('now', '-20 days')),
('l5', 'David Wilson', 'david.w@example.com', '214-555-0105', '654 Cedar Dr', 'Irving', 'TX', '75039', 'stormwatch', 'accepted', 'hot', 'storm1', 14500, 'Dennis', datetime('now', '-25 days')),
('l6', 'Jessica Taylor', 'jess.t@example.com', '469-555-0106', '987 Birch Rd', 'Dallas', 'TX', '75201', 'referral', 'in_progress', 'warm', NULL, 9500, 'Dennis', datetime('now', '-30 days')),
('l7', 'Robert Martinez', 'robert.m@example.com', '972-555-0107', '159 Willow Way', 'Irving', 'TX', '75038', 'manual', 'completed', 'cold', NULL, 5000, 'Dennis', datetime('now', '-45 days')),
('l8', 'Jennifer Anderson', 'jen.a@example.com', '214-555-0108', '753 Aspen Ct', 'Coppell', 'TX', '75019', 'thumbtack', 'paid', 'warm', NULL, 11000, 'Dennis', datetime('now', '-60 days')),
('l9', 'William Thomas', 'will.t@example.com', '469-555-0109', '852 Magnolia Blvd', 'Plano', 'TX', '75025', 'stormwatch', 'lost', 'cold', 'storm2', 0, 'Dennis', datetime('now', '-35 days')),
('l10', 'Linda Garcia', 'linda.g@example.com', '972-555-0110', '951 Cypress Cir', 'Frisco', 'TX', '75035', 'referral', 'new', 'warm', NULL, 10000, 'Dennis', datetime('now', '-1 day')),
('l11', 'Barbara Robinson', 'barb.r@example.com', '214-555-0111', '357 Redwood Dr', 'Dallas', 'TX', '75204', 'yelp', 'contacted', 'warm', NULL, 7500, 'Dennis', datetime('now', '-3 days')),
('l12', 'Richard Clark', 'rich.c@example.com', '469-555-0112', '147 Spruce St', 'Irving', 'TX', '75060', 'homeadvisor', 'scheduled', 'hot', 'storm1', 16000, 'Dennis', datetime('now', '-4 days')),
('l13', 'Susan Rodriguez', 'susan.r@example.com', '972-555-0113', '258 Sycamore Ln', 'Coppell', 'TX', '75019', 'manual', 'quoted', 'warm', NULL, 12500, 'Dennis', datetime('now', '-7 days')),
('l14', 'Joseph Lewis', 'joe.l@example.com', '214-555-0114', '369 Poplar Pl', 'Plano', 'TX', '75093', 'stormwatch', 'new', 'hot', 'storm2', 20000, 'Dennis', datetime('now', '-15 days')),
('l15', 'Margaret Lee', 'margaret.l@example.com', '469-555-0115', '741 Cherry Ave', 'Frisco', 'TX', '75033', 'referral', 'paid', 'warm', NULL, 8500, 'Dennis', datetime('now', '-50 days'));

-- Interactions
INSERT INTO interactions (id, lead_id, type, summary, created_at) VALUES
('i1', 'l1', 'call', 'Initial call - left voicemail', datetime('now', '-2 days')),
('i2', 'l1', 'sms', 'Sent follow-up text regarding storm damage inspection', datetime('now', '-1 day')),
('i3', 'l2', 'call', 'Spoke with Sarah, scheduled inspection for Tuesday', datetime('now', '-5 days')),
('i4', 'l2', 'email', 'Sent confirmation email for appointment', datetime('now', '-4 days')),
('i5', 'l3', 'note', 'Lead came from HomeAdvisor, looks promising', datetime('now', '-10 days')),
('i6', 'l4', 'inspection', 'Performed inspection, found hail damage on north slope', datetime('now', '-20 days')),
('i7', 'l4', 'email', 'Sent quote #Q-1004', datetime('now', '-19 days')),
('i8', 'l5', 'call', 'David called to accept quote', datetime('now', '-25 days')),
('i9', 'l6', 'sms', 'Crew arriving at 8am tomorrow', datetime('now', '-30 days')),
('i10', 'l12', 'call', 'Richard wants to reschedule', datetime('now', '-4 days'));

-- Appointments
INSERT INTO appointments (id, lead_id, type, scheduled_date, scheduled_time, status, address) VALUES
('a1', 'l3', 'inspection', datetime('now', '+2 days'), '10:00', 'scheduled', '789 Pine Ln, Plano, TX'),
('a2', 'l12', 'inspection', datetime('now', '+1 day'), '14:00', 'scheduled', '147 Spruce St, Irving, TX'),
('a3', 'l2', 'inspection', datetime('now', '-2 days'), '09:00', 'completed', '456 Oak Ave, Coppell, TX'),
('a4', 'l4', 'inspection', datetime('now', '-20 days'), '11:00', 'completed', '321 Elm St, Frisco, TX'),
('a5', 'l5', 'repair', datetime('now', '-22 days'), '08:00', 'completed', '654 Cedar Dr, Irving, TX');

-- Jobs
INSERT INTO jobs (id, lead_id, status, quote_amount, final_amount, payment_status, created_at) VALUES
('j1', 'l5', 'completed', 14500, 14500, 'unpaid', datetime('now', '-25 days')),
('j2', 'l6', 'in_progress', 9500, NULL, 'unpaid', datetime('now', '-30 days')),
('j3', 'l8', 'completed', 11000, 11000, 'paid', datetime('now', '-60 days')),
('j4', 'l15', 'completed', 8500, 8500, 'paid', datetime('now', '-50 days'));
