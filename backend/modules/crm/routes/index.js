// modules/crm/routes/index.js
const express = require('express');
const router = express.Router();
const ticketService = require('../services/ticket.service');
const leadRepo = require('../repositories/lead.repository');
const { authenticate } = require('../../shared/middleware/auth.middleware');

// Tickets
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await ticketService.listTickets();
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tickets', authenticate, async (req, res) => {
  try {
    const ticket = await ticketService.createTicket(req.body);
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leads
router.get('/leads', authenticate, async (req, res) => {
  try {
    const leads = await leadRepo.getAll();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Escalation Trigger (Manual for testing, can be hooked into a cron)
router.post('/tickets/escalate', authenticate, async (req, res) => {
  try {
    await ticketService.escalateTickets();
    res.json({ success: true, message: 'Escalation check completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
