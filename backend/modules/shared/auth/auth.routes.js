// modules/shared/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Fix #6: Rate-limit login — 10 requests per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

router.post('/login', loginLimiter, authController.login);
router.post('/register', authController.register);

// Fix #4: Protect user management routes — Admin only
router.get('/users', authenticate, authorize('Admin'), authController.getUsers);
router.patch('/users/:id/role', authenticate, authorize('Admin'), authController.updateUserRole);

module.exports = router;

