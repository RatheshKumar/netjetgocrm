// backend/modules/collab/routes/announcements.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM collab_announcements ORDER BY isPinned DESC, createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, body, category, priority, authorName, authorId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO collab_announcements (id, title, body, category, priority, authorName, authorId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, body || '', category || 'General', priority || 'Normal', authorName || 'Admin', authorId || '']
    );
    const [rows] = await pool.query('SELECT * FROM collab_announcements WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/pin', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT isPinned FROM collab_announcements WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Not found' });
    const newPinned = existing[0].isPinned ? 0 : 1;
    await pool.query('UPDATE collab_announcements SET isPinned = ? WHERE id = ?', [newPinned, req.params.id]);
    res.json({ isPinned: !!newPinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM collab_announcements WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
