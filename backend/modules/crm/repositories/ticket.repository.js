// modules/crm/repositories/ticket.repository.js
const pool = require('../../../config/db');

class TicketRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM crm_tickets ORDER BY createdAt DESC');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM crm_tickets WHERE id = ?', [id]);
    return rows[0];
  }

  async create(ticket) {
    const { id, subject, description, priority, status, assignedTo, source, shopName, submitterEmail } = ticket;
    const sql = `
      INSERT INTO crm_tickets (id, subject, description, priority, status, assignedTo, source, shopName, submitterEmail)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [id, subject, description, priority || 'Normal', status || 'Open', assignedTo, source || 'CRM', shopName, submitterEmail]);
  }

  async update(id, updates) {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE crm_tickets SET ${setClause} WHERE id = ?`;
    await pool.query(sql, [...values, id]);
  }

  async getExpiredSLA(hoursThreshold) {
    // Tickets older than threshold and not resolved
    const sql = `
      SELECT * FROM crm_tickets 
      WHERE status NOT IN ('Resolved', 'Closed') 
      AND createdAt < DATE_SUB(NOW(), INTERVAL ? HOUR)
    `;
    const [rows] = await pool.query(sql, [hoursThreshold]);
    return rows;
  }
}

module.exports = new TicketRepository();
