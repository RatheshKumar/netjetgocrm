// backend/modules/crm/routes/crm-extended.routes.js
const express = require('express');
const router = express.Router();
const pool = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../shared/middleware/auth.middleware');

const createCRUD = (table, fields, idField = 'id') => {
  // GET all with filtering
  router.get(`/${table}`, authenticate, async (req, res) => {
    try {
      let query = `SELECT * FROM crm_${table}`;
      let params = [];
      
      // Ownership Filtering
      if (['Sales Representative', 'Project Manager'].includes(req.user.role)) {
        query += ` WHERE assignedTo = ? OR assignedTo = '' OR assignedTo IS NULL`;
        params.push(req.user.name);
      }
      
      query += ` ORDER BY createdAt DESC`;
      const [rows] = await pool.query(query, params);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST new with implicit ownership
  router.post(`/${table}`, authenticate, async (req, res) => {
    try {
      const id = uuidv4();
      const allFields = [...fields, 'assignedTo'];
      const placeholders = ['?', ...allFields.map(() => '?')].join(', ');
      
      // If Sales/PM, lock assignee to self
      const body = { ...req.body };
      if (['Sales Representative', 'Project Manager'].includes(req.user.role)) {
        body.assignedTo = req.user.name;
      }

      const values = [id, ...allFields.map(f => body[f] || '')];
      
      await pool.query(
        `INSERT INTO crm_${table} (id, ${allFields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      const [rows] = await pool.query(`SELECT * FROM crm_${table} WHERE id = ?`, [id]);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${table}/:id`, authenticate, async (req, res) => {
    try {
      await pool.query(`DELETE FROM crm_${table} WHERE id = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

createCRUD('tasks', ['title', 'description', 'status', 'priority', 'dueDate', 'relatedTo']);
createCRUD('projects', ['name', 'description', 'status', 'startDate', 'endDate', 'budget']);
createCRUD('pipelines', ['name', 'status', 'description']);
createCRUD('contracts', ['title', 'clientName', 'value', 'startDate', 'endDate', 'status', 'description']);
createCRUD('invoices', ['invoiceNumber', 'clientName', 'amount', 'tax', 'total', 'dueDate', 'status', 'notes']);
createCRUD('payments', ['invoiceId', 'clientName', 'amount', 'method', 'status', 'paymentDate', 'notes']);
createCRUD('products', ['name', 'sku', 'price', 'stock', 'category', 'description']);

module.exports = router;
