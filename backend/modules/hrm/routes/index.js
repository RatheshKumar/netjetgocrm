// modules/hrm/routes/index.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const leavesRouter = require('./leaves.routes');
const attendanceRouter = require('./attendance.routes');
const departmentsRouter = require('./departments.routes');
const payrollRouter = require('./payroll.routes');

// Employee Routes
router.get('/employees', employeeController.getAll);
router.get('/employees/:id', employeeController.getById);
router.post('/employees', employeeController.create);
router.put('/employees/:id', employeeController.update || ((req, res) => res.status(501).json({ error: 'Not implemented' })));
router.delete('/employees/:id', employeeController.remove || ((req, res) => res.status(501).json({ error: 'Not implemented' })));

// Leave Management
router.use('/leaves', leavesRouter);

// Attendance
router.use('/attendance', attendanceRouter);

// Departments
router.use('/departments', departmentsRouter);

// Payroll
router.use('/payroll', payrollRouter);

// Recruitment
router.use('/recruitment', require('./recruitment.routes'));

module.exports = router;
