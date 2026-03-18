// modules/hrm/repositories/employee.repository.js
const pool = require('../../../config/db');

class EmployeeRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM hrm_employees');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM hrm_employees WHERE id = ?', [id]);
    return rows[0];
  }

  async getByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM hrm_employees WHERE email = ?', [email]);
    return rows[0];
  }

  async create(employee) {
    const { id, name, email, password, role, department } = employee;
    const sql = 'INSERT INTO hrm_employees (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(sql, [id, name, email, password, role, department]);
    return id;
  }

  async update(id, data) {
    // Basic dynamic update (for brevity in this example)
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE hrm_employees SET ${setClause} WHERE id = ?`;
    await pool.query(sql, [...values, id]);
  }

  async delete(id) {
    await pool.query('DELETE FROM hrm_employees WHERE id = ?', [id]);
  }
}

module.exports = new EmployeeRepository();
