// backend/modules/hrm/routes/departments.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hrm_departments ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, head, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO hrm_departments (id, name, head, description) VALUES (?, ?, ?, ?)`,
      [id, name, head || '', description || '']
    );
    const [rows] = await pool.query('SELECT * FROM hrm_departments WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, head, description } = req.body;
    await pool.query(
      `UPDATE hrm_departments SET name = ?, head = ?, description = ? WHERE id = ?`,
      [name, head || '', description || '', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM hrm_departments WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM hrm_departments WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
