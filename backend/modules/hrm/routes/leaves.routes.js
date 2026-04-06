// backend/modules/hrm/routes/leaves.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all leaves
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hrm_leaves ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create leave request
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, leaveType, startDate, endDate, days, reason } = req.body;
    if (!employeeName || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO hrm_leaves (id, employeeId, employeeName, leaveType, startDate, endDate, days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [id, employeeId || '', employeeName, leaveType, startDate, endDate, days || 1, reason || '']
    );
    const [rows] = await pool.query('SELECT * FROM hrm_leaves WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH approve/reject leave
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, approvedBy } = req.body;
    await pool.query(
      `UPDATE hrm_leaves SET status = ?, approvedBy = ?, approvedAt = NOW() WHERE id = ?`,
      [status, approvedBy || 'Admin', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM hrm_leaves WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE leave
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrm_leaves WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
