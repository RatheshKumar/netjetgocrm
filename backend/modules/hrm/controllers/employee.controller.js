// modules/hrm/controllers/employee.controller.js
const employeeService = require('../services/employee.service');

class EmployeeController {
  async getAll(req, res) {
    try {
      const emps = await employeeService.listAllEmployees();
      res.json(emps);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const emp = await employeeService.getEmployeeProfile(req.params.id);
      if (!emp) return res.status(404).json({ error: 'Employee not found' });
      res.json(emp);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const result = await employeeService.registerEmployee(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new EmployeeController();
