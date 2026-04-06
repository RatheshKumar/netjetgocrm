// backend/modules/hrm/routes/recruitment.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../shared/middleware/auth.middleware');

// GET all job postings
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM hrm_jobs ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new job
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, department, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO hrm_jobs (id, title, department, description, status) VALUES (?, ?, ?, ?, ?)`,
      [id, title, department || '', description || '', status || 'Open']
    );
    const [rows] = await pool.query('SELECT * FROM hrm_jobs WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE job
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM hrm_jobs WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
