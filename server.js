// server.js
import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ===================================================
// Turso / libSQL Connection
// ===================================================
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'libsql://database-cobalt-paddle-vercel-icfg-gnl4z0e3qpobxlg3ufhct9dw.aws-ap-south-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ===================================================
// Initialize Tables
// ===================================================
async function initDB() {
  try {
    console.log('⏳ Initializing database tables...');

    // Generic storage table (for ERP and other entities)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS storage (
        "key" TEXT PRIMARY KEY,
        "value" TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS crm_users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Leads table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        status TEXT DEFAULT 'Pending',
        value DECIMAL(15,2) DEFAULT 0,
        owner TEXT,
        source TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contacts table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        jobTitle TEXT,
        company TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Companies table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        website TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        size TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Login logs
    await client.execute(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        email TEXT NOT NULL,
        system TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        loginAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
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
      INSERT INTO crm_users (id, name, email, password, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    await client.execute({ sql, args: [id, name, email, hashedPassword, role || 'user'] });

    res.status(201).json({ success: true, id, name, email, role: role || 'user' });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
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

    const result = await client.execute({ sql: 'SELECT * FROM crm_users WHERE email = ?', args: [email] });
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Log login
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    await client.execute({
      sql: 'INSERT INTO login_logs (userId, email, system, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)',
      args: [user.id, email, system || 'web', ipAddress, userAgent],
    });

    res.json({ success: true, id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// GENERIC CRUD HELPER
// ===================================================
const createHandlers = (tableName, allowedCols) => {
  return {
    getAll: async (req, res) => {
      try {
        const result = await client.execute(`SELECT * FROM ${tableName} ORDER BY createdAt DESC`);
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    getOne: async (req, res) => {
      try {
        const result = await client.execute({ sql: `SELECT * FROM ${tableName} WHERE id = ?`, args: [req.params.id] });
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    create: async (req, res) => {
      try {
        const id = uuid();
        const data = req.body;
        const keys = ['id', ...allowedCols, 'createdAt', 'updatedAt'];
        const placeholders = keys.map(() => '?').join(', ');
        
        const args = [id];
        allowedCols.forEach(col => args.push(data[col] || null));
        args.push(new Date().toISOString());
        args.push(new Date().toISOString());

        const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
        await client.execute({ sql, args });
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
        const args = [];

        allowedCols.forEach(col => {
          if (data[col] !== undefined) {
            updates.push(`${col} = ?`);
            args.push(data[col]);
          }
        });

        if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

        updates.push(`updatedAt = ?`);
        args.push(new Date().toISOString());
        args.push(id);

        const sql = `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?`;
        await client.execute({ sql, args });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },
    delete: async (req, res) => {
      try {
        await client.execute({ sql: `DELETE FROM ${tableName} WHERE id = ?`, args: [req.params.id] });
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  };
};

// ===================================================
// ENTITY ROUTES
// ===================================================

// Users
const userHandlers = createHandlers('crm_users', ['name', 'email', 'role']);
app.get('/api/users', userHandlers.getAll);
app.get('/api/users/:id', userHandlers.getOne);
app.put('/api/users/:id', userHandlers.update);
app.delete('/api/users/:id', userHandlers.delete);

// Leads
const leadHandlers = createHandlers('leads', ['name', 'company', 'email', 'phone', 'status', 'value', 'owner', 'source', 'notes']);
app.get('/api/leads', leadHandlers.getAll);
app.get('/api/leads/:id', leadHandlers.getOne);
app.post('/api/leads', leadHandlers.create);
app.put('/api/leads/:id', leadHandlers.update);
app.delete('/api/leads/:id', leadHandlers.delete);

// Contacts
const contactHandlers = createHandlers('contacts', ['name', 'email', 'phone', 'jobTitle', 'company', 'notes']);
app.get('/api/contacts', contactHandlers.getAll);
app.get('/api/contacts/:id', contactHandlers.getOne);
app.post('/api/contacts', contactHandlers.create);
app.put('/api/contacts/:id', contactHandlers.update);
app.delete('/api/contacts/:id', contactHandlers.delete);

// Companies
const companyHandlers = createHandlers('companies', ['name', 'industry', 'website', 'email', 'phone', 'address', 'size']);
app.get('/api/companies', companyHandlers.getAll);
app.get('/api/companies/:id', companyHandlers.getOne);
app.post('/api/companies', companyHandlers.create);
app.put('/api/companies/:id', companyHandlers.update);
app.delete('/api/companies/:id', companyHandlers.delete);


// ===================================================
// GENERIC STORAGE API — Fallback for ERP & other entities
// ===================================================

app.get('/api/storage', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix) return res.status(400).json({ error: 'Prefix required' });
  try {
    const result = await client.execute({ sql: 'SELECT "key" FROM storage WHERE "key" LIKE ?', args: [`${prefix}%`] });
    res.json({ keys: result.rows.map(r => r.key) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/storage/:key', async (req, res) => {
  try {
    const result = await client.execute({ sql: 'SELECT "value" FROM storage WHERE "key" = ?', args: [req.params.key] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(JSON.parse(result.rows[0].value));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  const value = req.body;
  try {
    const sql = `INSERT INTO storage ("key", "value") VALUES (?, ?) ON CONFLICT("key") DO UPDATE SET "value" = excluded."value"`;
    await client.execute({ sql, args: [key, JSON.stringify(value)] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  try {
    await client.execute({ sql: 'DELETE FROM storage WHERE "key" = ?', args: [key] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN LOGS ─────────────────────────────────────
app.post('/api/logs/login', async (req, res) => {
  const { userId, email, system } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  try {
    const sql = `INSERT INTO login_logs (userId, email, system, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)`;
    const result = await client.execute({ sql, args: [userId || null, email, system, ipAddress, userAgent] });
    res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// FINAL ROUTES
// ===================================================

app.get('/', (req, res) => {
  res.json({ status: '🚀 CRM Backend Running', engine: 'libSQL/Turso' });
});

// START SERVER
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

export default app; // For Vercel