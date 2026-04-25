// modules/shared/storage/storage.routes.js
const express = require('express');
const router = express.Router();
const storageRepo = require('./storage.repository');
const { authenticate } = require('../middleware/auth.middleware');

// All storage routes require authentication (Fix #5)
router.use(authenticate);

// Helper: enforce key belongs to the requesting user (or admin can bypass)
function assertKeyOwnership(req, res, key) {
  if (req.user.role !== 'Admin' && !key.startsWith(`user:${req.user.id}:`)) {
    res.status(403).json({ error: 'Access denied: key does not belong to you' });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix) return res.status(400).json({ error: 'Prefix required' });
  // Non-admins can only list their own prefix
  const effectivePrefix = req.user.role === 'Admin' ? prefix : `user:${req.user.id}:${prefix}`;
  try {
    const keys = await storageRepo.getKeys(effectivePrefix);
    res.json({ keys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:key', async (req, res) => {
  if (!assertKeyOwnership(req, res, req.params.key)) return;
  try {
    const value = await storageRepo.getValue(req.params.key);
    if (!value) return res.status(404).json({ error: 'Not found' });
    res.json(value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:key', async (req, res) => {
  if (!assertKeyOwnership(req, res, req.params.key)) return;
  try {
    await storageRepo.setValue(req.params.key, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:key', async (req, res) => {
  if (!assertKeyOwnership(req, res, req.params.key)) return;
  try {
    await storageRepo.deleteValue(req.params.key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

