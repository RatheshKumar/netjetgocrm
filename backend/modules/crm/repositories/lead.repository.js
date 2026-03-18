// modules/crm/repositories/lead.repository.js
const pool = require('../../../config/db');

class LeadRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM crm_leads ORDER BY createdAt DESC');
    return rows;
  }

  async create(lead) {
    const { id, name, email, status, value, assignedTo } = lead;
    const sql = 'INSERT INTO crm_leads (id, name, email, status, value, assignedTo) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(sql, [id, name, email, status || 'New', value || 0, assignedTo]);
  }
}

module.exports = new LeadRepository();
