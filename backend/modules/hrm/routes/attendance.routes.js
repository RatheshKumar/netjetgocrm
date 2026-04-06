// backend/modules/hrm/routes/attendance.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

// GET all attendance (optionally filter by date or employeeId)
router.get('/', async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    let query = 'SELECT * FROM hrm_attendance';
    const params = [];
    const conditions = [];
    if (date) { conditions.push('date = ?'); params.push(date); }
    if (employeeId) { conditions.push('employeeId = ?'); params.push(employeeId); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY date DESC, clockIn DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST clock in
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, date, clockIn, clockOut, hoursWorked, status, notes } = req.body;
    if (!employeeName || !date) return res.status(400).json({ error: 'employeeName and date required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO hrm_attendance (id, employeeId, employeeName, date, clockIn, clockOut, hoursWorked, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employeeId || '', employeeName, date, clockIn || null, clockOut || null, hoursWorked || null, status || 'Present', notes || '']
    );
    const [rows] = await pool.query('SELECT * FROM hrm_attendance WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update attendance record (clock out)
router.patch('/:id', async (req, res) => {
  try {
    const { clockOut, hoursWorked, status, notes } = req.body;
    await pool.query(
      `UPDATE hrm_attendance SET clockOut = ?, hoursWorked = ?, status = ?, notes = ? WHERE id = ?`,
      [clockOut, hoursWorked, status || 'Present', notes || '', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM hrm_attendance WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrm_attendance WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
