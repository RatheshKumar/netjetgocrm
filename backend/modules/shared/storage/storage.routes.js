// modules/shared/storage/storage.routes.js
const express = require('express');
const router = express.Router();
const storageRepo = require('./storage.repository');

router.get('/', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix) return res.status(400).json({ error: 'Prefix required' });
  try {
    const keys = await storageRepo.getKeys(prefix);
    res.json({ keys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const value = await storageRepo.getValue(req.params.key);
    if (!value) return res.status(404).json({ error: 'Not found' });
    res.json(value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:key', async (req, res) => {
  try {
    await storageRepo.setValue(req.params.key, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:key', async (req, res) => {
  try {
    await storageRepo.deleteValue(req.params.key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
