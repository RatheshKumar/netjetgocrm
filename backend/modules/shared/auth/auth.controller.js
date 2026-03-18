// modules/shared/auth/auth.controller.js
const authService = require('./auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.authenticate(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  // User Management
  async getUsers(req, res) {
    try {
      const pool = require('../../../config/db');
      const [rows] = await pool.query('SELECT id, name, email, role FROM hrm_employees');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const pool = require('../../../config/db');
      await pool.query('UPDATE hrm_employees SET role = ? WHERE id = ?', [role, id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();
