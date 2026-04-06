// backend/modules/collab/routes/meetings.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM collab_meetings ORDER BY meetingDate ASC, meetingTime ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, meetingDate, meetingTime, duration, location, meetLink, organizer, organizerId } = req.body;
    if (!title || !meetingDate || !meetingTime) return res.status(400).json({ error: 'Title, date and time are required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO collab_meetings (id, title, description, meetingDate, meetingTime, duration, location, meetLink, status, organizer, organizerId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?)`,
      [id, title, description || '', meetingDate, meetingTime, duration || 60, location || '', meetLink || '', organizer || 'Admin', organizerId || '']
    );
    const [rows] = await pool.query('SELECT * FROM collab_meetings WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE collab_meetings SET status = ? WHERE id = ?', [status, req.params.id]);
    const [rows] = await pool.query('SELECT * FROM collab_meetings WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM collab_meetings WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
