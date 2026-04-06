// modules/crm/routes/index.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const ticketService = require('../services/ticket.service');
const leadRepo = require('../repositories/lead.repository');
const { authenticate } = require('../../shared/middleware/auth.middleware');

// ── Tickets ───────────────────────────────────────────────────────────────────
router.get('/tickets', authenticate, async (req, res) => {
  try { 
    if (req.user.role === 'Sales Representative') {
      // Filter by companies/contacts assigned to this rep
      const [rows] = await pool.query(`
        SELECT t.* FROM crm_tickets t
        LEFT JOIN crm_companies c ON t.shopName = c.name
        LEFT JOIN crm_contacts cn ON t.submitterEmail = cn.email
        WHERE c.assignedTo = ? OR cn.assignedTo = ? OR t.assignedTo = ?
      `, [req.user.name, req.user.name, req.user.name]);
      return res.json(rows);
    }
    res.json(await ticketService.listTickets()); 
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/tickets', authenticate, async (req, res) => {
  try { res.status(201).json(await ticketService.createTicket(req.body)); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.patch('/tickets/:id', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE crm_tickets SET status = ?, assignedTo = ?, priority = ? WHERE id = ?',
      [req.body.status, req.body.assignedTo, req.body.priority, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM crm_tickets WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/tickets/:id', authenticate, async (req, res) => {
  try { await pool.query('DELETE FROM crm_tickets WHERE id = ?', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Leads ─────────────────────────────────────────────────────────────────────
router.get('/leads', authenticate, async (req, res) => {
  try { 
    if (req.user.role === 'Sales Representative') {
      const [rows] = await pool.query('SELECT * FROM crm_leads WHERE assignedTo = ? OR assignedTo = "" ORDER BY createdAt DESC', [req.user.name]);
      return res.json(rows);
    }
    res.json(await leadRepo.getAll()); 
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/leads', authenticate, async (req, res) => {
  try {
    const { name, company, email, phone, status, value, assignedTo, source, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO crm_leads (id, name, company, email, phone, status, value, assignedTo, source, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [id, name, company||'', email||'', phone||'', status||'New', value||0, assignedTo||'', source||'', notes||'']
    );
    const [rows] = await pool.query('SELECT * FROM crm_leads WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.patch('/leads/:id', authenticate, async (req, res) => {
  try {
    const { name, company, email, phone, status, value, assignedTo, source, notes } = req.body;
    await pool.query(
      `UPDATE crm_leads SET name=?,company=?,email=?,phone=?,status=?,value=?,assignedTo=?,source=?,notes=? WHERE id=?`,
      [name, company||'', email||'', phone||'', status||'New', value||0, assignedTo||'', source||'', notes||'', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM crm_leads WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/leads/:id', authenticate, async (req, res) => {
  try { await pool.query('DELETE FROM crm_leads WHERE id = ?', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Contacts ──────────────────────────────────────────────────────────────────
router.get('/contacts', authenticate, async (req, res) => {
  try { 
    let query = 'SELECT * FROM crm_contacts';
    let params = [];
    if (req.user.role === 'Sales Representative') {
      query += ' WHERE assignedTo = ? OR assignedTo = ""';
      params.push(req.user.name);
    }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params); 
    res.json(rows); 
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/contacts', authenticate, async (req, res) => {
  try {
    const { name, email, phone, jobTitle, company, notes, assignedTo } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    const finalAssignee = req.user.role === 'Sales Representative' ? req.user.name : (assignedTo || '');
    await pool.query(`INSERT INTO crm_contacts (id,name,email,phone,jobTitle,company,notes,assignedTo) VALUES (?,?,?,?,?,?,?,?)`,
      [id, name, email||'', phone||'', jobTitle||'', company||'', notes||'', finalAssignee]);
    const [rows] = await pool.query('SELECT * FROM crm_contacts WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/contacts/:id', authenticate, async (req, res) => {
  try {
    const { name, email, phone, jobTitle, company, notes, assignedTo } = req.body;
    await pool.query(`UPDATE crm_contacts SET name=?,email=?,phone=?,jobTitle=?,company=?,notes=?,assignedTo=? WHERE id=?`,
      [name, email||'', phone||'', jobTitle||'', company||'', notes||'', assignedTo||'', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM crm_contacts WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/contacts/:id', authenticate, async (req, res) => {
  try { await pool.query('DELETE FROM crm_contacts WHERE id = ?', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Companies ─────────────────────────────────────────────────────────────────
router.get('/companies', authenticate, async (req, res) => {
  try { 
    let query = 'SELECT * FROM crm_companies';
    let params = [];
    if (req.user.role === 'Sales Representative') {
      query += ' WHERE assignedTo = ? OR assignedTo = ""';
      params.push(req.user.name);
    }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params); 
    res.json(rows); 
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/companies', authenticate, async (req, res) => {
  try {
    const { name, industry, website, email, phone, address, size, assignedTo } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = uuidv4();
    const finalAssignee = req.user.role === 'Sales Representative' ? req.user.name : (assignedTo || '');
    await pool.query(`INSERT INTO crm_companies (id,name,industry,website,email,phone,address,size,assignedTo) VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, name, industry||'', website||'', email||'', phone||'', address||'', size||'', finalAssignee]);
    const [rows] = await pool.query('SELECT * FROM crm_companies WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/companies/:id', authenticate, async (req, res) => {
  try {
    const { name, industry, website, email, phone, address, size, assignedTo } = req.body;
    await pool.query(`UPDATE crm_companies SET name=?,industry=?,website=?,email=?,phone=?,address=?,size=?,assignedTo=? WHERE id=?`,
      [name, industry||'', website||'', email||'', phone||'', address||'', size||'', assignedTo||'', req.params.id]);
    const [rows] = await pool.query('SELECT * FROM crm_companies WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/companies/:id', authenticate, async (req, res) => {
  try { await pool.query('DELETE FROM crm_companies WHERE id = ?', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Campaigns ─────────────────────────────────────────────────────────────────
router.get('/campaigns', authenticate, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM crm_campaigns ORDER BY createdAt DESC'); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/campaigns', authenticate, async (req, res) => {
  try {
    const { name, channel, status, budget, leads, startDate, endDate, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Campaign name required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO crm_campaigns (id,name,channel,status,budget,leads,startDate,endDate,description) VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, name, channel||'Email', status||'Draft', budget||0, leads||0, startDate||null, endDate||null, description||'']
    );
    const [rows] = await pool.query('SELECT * FROM crm_campaigns WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/campaigns/:id', authenticate, async (req, res) => {
  try {
    const { name, channel, status, budget, leads, startDate, endDate, description } = req.body;
    await pool.query(
      `UPDATE crm_campaigns SET name=?,channel=?,status=?,budget=?,leads=?,startDate=?,endDate=?,description=? WHERE id=?`,
      [name, channel||'Email', status||'Draft', budget||0, leads||0, startDate||null, endDate||null, description||'', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM crm_campaigns WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/campaigns/:id', authenticate, async (req, res) => {
  try { await pool.query('DELETE FROM crm_campaigns WHERE id = ?', [req.params.id]); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Escalation ────────────────────────────────────────────────────────────────
router.post('/tickets/escalate', authenticate, async (req, res) => {
  try { await ticketService.escalateTickets(); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    let leadFilter = '';
    let params = [];
    if (req.user.role === 'Sales Representative') {
      leadFilter = ' WHERE assignedTo = ? OR assignedTo = ""';
      params.push(req.user.name);
    }
    const [[leadStats]] = await pool.query(`SELECT COUNT(*) as total, SUM(value) as totalValue, SUM(CASE WHEN status='Won' THEN 1 ELSE 0 END) as won FROM crm_leads ${leadFilter}`, params);
    const [[ticketStats]] = await pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status='Open' THEN 1 ELSE 0 END) as open FROM crm_tickets`);
    const [[contactStats]] = await pool.query(`SELECT COUNT(*) as total FROM crm_contacts ${leadFilter}`, params);
    res.json({ leads: leadStats, tickets: ticketStats, contacts: contactStats });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Extended CRM ─────────────────────────────────────────────────────────────
router.use('/', require('./crm-extended.routes'));

module.exports = router;
