// modules/shared/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/login', authController.login);
router.get('/users', authController.getUsers);
router.patch('/users/:id/role', authController.updateUserRole);

module.exports = router;
