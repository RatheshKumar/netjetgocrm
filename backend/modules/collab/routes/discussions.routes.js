// backend/modules/collab/routes/discussions.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const { roomName } = req.query;
    let query = 'SELECT * FROM collab_discussions';
    const params = [];
    if (roomName) { query += ' WHERE roomName = ?'; params.push(roomName); }
    query += ' ORDER BY createdAt ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT roomName, topic, MAX(createdAt) as lastActivity, COUNT(*) as postCount
       FROM collab_discussions WHERE parentId IS NULL
       GROUP BY roomName, topic ORDER BY lastActivity DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { roomName, topic, message, authorName, authorId, parentId } = req.body;
    if (!roomName || !message) return res.status(400).json({ error: 'roomName and message required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO collab_discussions (id, roomName, topic, message, authorName, authorId, parentId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, roomName, topic || '', message, authorName || 'Anonymous', authorId || '', parentId || null]
    );
    const [rows] = await pool.query('SELECT * FROM collab_discussions WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM collab_discussions WHERE id = ? OR parentId = ?', [req.params.id, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
