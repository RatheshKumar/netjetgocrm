// server.js — CommonJS format
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { v4: uuid } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ===================================================
// MySQL Connection Pool
// ===================================================
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'netjetgocrm_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ===================================================
// Initialize Tables
// ===================================================
async function initDB() {
  try {
    console.log('⏳ Initializing MySQL database tables...');

    // Generic storage table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS storage (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        value DECIMAL(15,2) DEFAULT 0,
        owner VARCHAR(255),
        source VARCHAR(255),
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Contacts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        jobTitle VARCHAR(255),
        company VARCHAR(255),
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        website VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        size VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Login logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` VARCHAR(255),
        \`email\` VARCHAR(255) NOT NULL,
        \`system\` VARCHAR(100) NOT NULL,
        \`ipAddress\` VARCHAR(100),
        \`userAgent\` TEXT,
        \`loginAt\` DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ MySQL Tables initialized successfully.');
  } catch (err) {
    console.error('❌ MySQL Database initialization error:', err.message);
  }
}

initDB();

// ===================================================
// AUTH ROUTES
// ===================================================

// Signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuid();

    const sql = `
      INSERT INTO crm_users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [id, name, email, hashedPassword, role || 'user']);

    res.status(201).json({ success: true, id, name, email, role: role || 'user' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password, system } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const [rows] = await pool.query('SELECT * FROM crm_users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    await pool.query(
      'INSERT INTO login_logs (`userId`, `email`, `system`, `ipAddress`, `userAgent`) VALUES (?, ?, ?, ?, ?)',
      [user.id, email, system || 'web', ipAddress, userAgent]
    );

    res.json({ success: true, id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// GENERIC CRUD HELPER
// ===================================
function createHandlers(tableName, allowedCols) {
  return {
    getAll: async (req, res) => {
      try {
        const [rows] = await pool.query(`SELECT * FROM ${tableName} ORDER BY createdAt DESC`);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    getOne: async (req, res) => {
      try {
        const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    create: async (req, res) => {
      try {
        const id = uuid();
        const data = req.body;
        const keys = ['id', ...allowedCols];
        const values = [id];
        allowedCols.forEach(col => values.push(data[col] !== undefined ? data[col] : null));

        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        await pool.query(sql, values);
        res.status(201).json({ success: true, id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    update: async (req, res) => {
      try {
        const { id } = req.params;
        const data = req.body;
        const updates = [];
        const values = [];

        allowedCols.forEach(col => {
          if (data[col] !== undefined) {
            updates.push(`${col} = ?`);
            values.push(data[col]);
          }
        });

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        values.push(id);
        const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`;
        await pool.query(sql, values);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    delete: async (req, res) => {
      try {
        await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [req.params.id]);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
  };
}

// Entity Handlers
const userHandlers = createHandlers('crm_users', ['name', 'email', 'role']);
app.get('/api/users', userHandlers.getAll);
app.get('/api/users/:id', userHandlers.getOne);
app.put('/api/users/:id', userHandlers.update);
app.delete('/api/users/:id', userHandlers.delete);

const leadHandlers = createHandlers('leads', ['name', 'company', 'email', 'phone', 'status', 'value', 'owner', 'source', 'notes']);
app.get('/api/leads', leadHandlers.getAll);
app.get('/api/leads/:id', leadHandlers.getOne);
app.post('/api/leads', leadHandlers.create);
app.put('/api/leads/:id', leadHandlers.update);
app.delete('/api/leads/:id', leadHandlers.delete);

const contactHandlers = createHandlers('contacts', ['name', 'email', 'phone', 'jobTitle', 'company', 'notes']);
app.get('/api/contacts', contactHandlers.getAll);
app.get('/api/contacts/:id', contactHandlers.getOne);
app.post('/api/contacts', contactHandlers.create);
app.put('/api/contacts/:id', contactHandlers.update);
app.delete('/api/contacts/:id', contactHandlers.delete);

const companyHandlers = createHandlers('companies', ['name', 'industry', 'website', 'email', 'phone', 'address', 'size']);
app.get('/api/companies', companyHandlers.getAll);
app.get('/api/companies/:id', companyHandlers.getOne);
app.post('/api/companies', companyHandlers.create);
app.put('/api/companies/:id', companyHandlers.update);
app.delete('/api/companies/:id', companyHandlers.delete);

// Generic Storage
app.get('/api/storage', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix) return res.status(400).json({ error: 'Prefix required' });
  try {
    const [rows] = await pool.query('SELECT `key` FROM storage WHERE `key` LIKE ?', [`${prefix}%`]);
    res.json({ keys: rows.map(r => r.key) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `value` FROM storage WHERE `key` = ?', [req.params.key]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(JSON.parse(rows[0].value));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  const value = req.body;
  try {
    const sql = `
      INSERT INTO storage (\`key\`, \`value\`) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
    `;
    await pool.query(sql, [key, JSON.stringify(value)]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/storage/:key', async (req, res) => {
  try {
    await pool.query('DELETE FROM storage WHERE `key` = ?', [req.params.key]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs/login', async (req, res) => {
  const { userId, email, system } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  try {
    const sql = `INSERT INTO login_logs (\`userId\`, \`email\`, \`system\`, \`ipAddress\`, \`userAgent\`) VALUES (?, ?, ?, ?, ?)`;
    await pool.query(sql, [userId || null, email, system, ipAddress, userAgent]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: '🚀 CRM Backend Running', engine: 'MySQL' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

module.exports = app;