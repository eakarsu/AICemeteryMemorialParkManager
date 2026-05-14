/**
 * Notification system for upcoming burials, anniversaries, and events.
 *
 * POST /api/notifications/configure  - Set email/SMS alert preferences
 * GET  /api/notifications/upcoming   - List events in the next 30 days
 * GET  /api/notifications/configured - Get current configuration
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { IntermentSchedule, CeremonySchedule, MemorialEvent, BurialRecord } = require('../models');
const { Op } = require('sequelize');

router.use(authMiddleware);

// In-memory config store (keyed by user_id)
const notificationConfigs = new Map();

// ─── Email helper ─────────────────────────────────────────────────────────────

async function sendEmail(to, subject, body) {
  if (!process.env.SMTP_HOST) return false; // gracefully skip
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: body
    });
    return true;
  } catch (err) {
    console.warn('[Notifications] Email failed:', err.message);
    return false;
  }
}

// ─── POST /api/notifications/configure ────────────────────────────────────────

router.post('/configure', (req, res) => {
  try {
    const { email, phone, notify_burials, notify_anniversaries, notify_ceremonies, notify_events, days_ahead } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ error: 'At least one of email or phone is required' });
    }

    const config = {
      user_id: req.user.id,
      email: email || null,
      phone: phone || null,
      notify_burials: notify_burials !== false,
      notify_anniversaries: notify_anniversaries !== false,
      notify_ceremonies: notify_ceremonies !== false,
      notify_events: notify_events !== false,
      days_ahead: Number(days_ahead) || 30,
      configured_at: new Date().toISOString()
    };

    notificationConfigs.set(req.user.id, config);
    res.json({ message: 'Notification preferences saved', config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/notifications/configured ────────────────────────────────────────

router.get('/configured', (req, res) => {
  const config = notificationConfigs.get(req.user.id);
  if (!config) return res.json({ message: 'No notification preferences configured', config: null });
  res.json({ config });
});

// ─── GET /api/notifications/upcoming ─────────────────────────────────────────

router.get('/upcoming', async (req, res) => {
  try {
    const config = notificationConfigs.get(req.user.id) || {};
    const daysAhead = Number(req.query.days) || config.days_ahead || 30;

    const today = new Date();
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);
    const todayStr = today.toISOString().split('T')[0];
    const futureStr = future.toISOString().split('T')[0];

    const dateRange = { [Op.between]: [todayStr, futureStr] };
    const upcoming = { burials: [], ceremonies: [], events: [], anniversaries: [] };

    // Upcoming interments/burials
    try {
      upcoming.burials = await IntermentSchedule.findAll({
        where: { scheduled_date: dateRange, status: 'scheduled' },
        order: [['scheduled_date', 'ASC']]
      });
    } catch (_) {}

    // Upcoming ceremonies
    try {
      upcoming.ceremonies = await CeremonySchedule.findAll({
        where: { scheduled_date: dateRange, status: ['scheduled', 'confirmed'] },
        order: [['scheduled_date', 'ASC']]
      });
    } catch (_) {}

    // Upcoming memorial events
    try {
      upcoming.events = await MemorialEvent.findAll({
        where: { event_date: dateRange, status: ['planning', 'confirmed'] },
        order: [['event_date', 'ASC']]
      });
    } catch (_) {}

    // Death anniversaries (same month/day as date_of_burial, any year)
    try {
      const burials = await BurialRecord.findAll({ attributes: ['id', 'deceased_first_name', 'deceased_last_name', 'date_of_burial', 'date_of_death'] });
      for (const b of burials) {
        if (!b.date_of_burial) continue;
        const [, mm, dd] = b.date_of_burial.split('-');
        // Check if anniversary falls in our window
        const thisYear = today.getFullYear();
        for (const y of [thisYear, thisYear + 1]) {
          const anniv = new Date(`${y}-${mm}-${dd}`);
          if (anniv >= today && anniv <= future) {
            const yearsAgo = y - Number(b.date_of_burial.split('-')[0]);
            if (yearsAgo > 0) {
              upcoming.anniversaries.push({
                id: b.id,
                deceased_name: `${b.deceased_first_name} ${b.deceased_last_name}`,
                anniversary_date: `${y}-${mm}-${dd}`,
                years: yearsAgo,
                type: 'burial_anniversary'
              });
            }
          }
        }
      }
      upcoming.anniversaries.sort((a, b) => a.anniversary_date.localeCompare(b.anniversary_date));
    } catch (_) {}

    const totalItems = upcoming.burials.length + upcoming.ceremonies.length + upcoming.events.length + upcoming.anniversaries.length;

    // Send summary email if configured
    if (config.email && totalItems > 0) {
      const emailBody = [
        `Upcoming events in the next ${daysAhead} days:`,
        `- Burials: ${upcoming.burials.length}`,
        `- Ceremonies: ${upcoming.ceremonies.length}`,
        `- Events: ${upcoming.events.length}`,
        `- Anniversaries: ${upcoming.anniversaries.length}`
      ].join('\n');
      await sendEmail(config.email, `Cemetery Manager: ${totalItems} Upcoming Events`, emailBody);
    }

    res.json({
      period: { from: todayStr, to: futureStr, days_ahead: daysAhead },
      summary: {
        total: totalItems,
        burials: upcoming.burials.length,
        ceremonies: upcoming.ceremonies.length,
        events: upcoming.events.length,
        anniversaries: upcoming.anniversaries.length
      },
      upcoming
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
