// modules/shared/auth/auth.controller.js
const authService = require('./auth.service');
const pool        = require('../../../config/db');
const { ok, fail } = require('../utils/response');

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!email || !password || !name) return fail(res, 'Name, email, and password are required', 400);

      const employeeService = require('../../hrm/services/employee.service');
      // Fix role escalation vulnerability: Force default role to 'Pending'
      const data = { name, email, password, role: 'Pending', status: 'Active' };
      const result = await employeeService.registerEmployee(data);
      
      return ok(res, result, 201);
    } catch (err) {
      // If employee exists, map to 400
      if (err.message && err.message.includes('already exists')) {
        err.status = 400;
      }
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return fail(res, 'email and password are required', 400);
      const result = await authService.authenticate(email, password);
      return ok(res, result);
    } catch (err) {
      // Credential errors are 401; propagate everything else
      err.status = err.status || 401;
      next(err);
    }
  }

  async getUsers(req, res, next) {
    try {
      const [rows] = await pool.query('SELECT id, name, email, role FROM hrm_employees');
      return ok(res, rows);
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role) return fail(res, 'role is required', 400);
      await pool.query('UPDATE hrm_employees SET role = ? WHERE id = ?', [role, id]);
      return ok(res, { updated: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
