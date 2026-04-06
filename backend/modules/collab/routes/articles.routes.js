// backend/modules/collab/routes/articles.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM collab_articles';
    const params = [];
    if (category && category !== 'All') { query += ' WHERE category = ?'; params.push(category); }
    query += ' ORDER BY createdAt DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, category, tags, authorName, authorId } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const id = uuidv4();
    await pool.query(
      `INSERT INTO collab_articles (id, title, content, category, tags, status, authorName, authorId)
       VALUES (?, ?, ?, ?, ?, 'Published', ?, ?)`,
      [id, title, content || '', category || 'General', tags || '', authorName || 'Admin', authorId || '']
    );
    const [rows] = await pool.query('SELECT * FROM collab_articles WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    await pool.query(
      `UPDATE collab_articles SET title = ?, content = ?, category = ?, tags = ? WHERE id = ?`,
      [title, content || '', category || 'General', tags || '', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM collab_articles WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM collab_articles WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
