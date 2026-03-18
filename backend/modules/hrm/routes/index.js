// modules/hrm/routes/index.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');

// Employee Routes
router.get('/employees', employeeController.getAll);
router.get('/employees/:id', employeeController.getById);
router.post('/employees', employeeController.create);

// Attendance routes could go here...
// router.get('/attendance', attendanceController.get);

module.exports = router;
