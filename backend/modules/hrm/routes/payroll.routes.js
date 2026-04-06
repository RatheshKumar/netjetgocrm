// backend/modules/hrm/routes/payroll.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM hrm_payroll';
    const params = [];
    const conditions = [];
    if (month) { conditions.push('month = ?'); params.push(month); }
    if (year) { conditions.push('year = ?'); params.push(year); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, month, year, basicPay, allowances, deductions } = req.body;
    if (!employeeName || !month || !year) return res.status(400).json({ error: 'Required fields missing' });
    const netPay = (parseFloat(basicPay) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0);
    const id = uuidv4();
    await pool.query(
      `INSERT INTO hrm_payroll (id, employeeId, employeeName, month, year, basicPay, allowances, deductions, netPay, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [id, employeeId || '', employeeName, month, year, basicPay || 0, allowances || 0, deductions || 0, netPay]
    );
    const [rows] = await pool.query('SELECT * FROM hrm_payroll WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const paidAt = status === 'Paid' ? new Date() : null;
    await pool.query(
      `UPDATE hrm_payroll SET status = ?, paidAt = ? WHERE id = ?`,
      [status, paidAt, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM hrm_payroll WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrm_payroll WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
