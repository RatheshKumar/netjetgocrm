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
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ===================================================
// Initialize Tables
// ===================================================
async function initDB() {
  try {
    console.log('⏳ Initializing database tables...');

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
// Utility function for timestamps
// ===================================================
function now() {
  return new Date().toISOString();
}

// ===================================================
// USER ROUTES
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

// Get all users (exclude password)
app.get('/api/users', async (req, res) => {
  try {
    const result = await client.execute({
      sql: 'SELECT id, name, email, role, createdAt, updatedAt FROM crm_users',
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const updates = [];
    const args = [];

    if (name) { updates.push('name = ?'); args.push(name); }
    if (email) { updates.push('email = ?'); args.push(email); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      args.push(hashed);
    }
    if (role) { updates.push('role = ?'); args.push(role); }

    updates.push('updatedAt = datetime(\'now\')');

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    args.push(id);

    const sql = `UPDATE crm_users SET ${updates.join(', ')} WHERE id = ?`;
    await client.execute({ sql, args });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await client.execute({ sql: 'DELETE FROM crm_users WHERE id = ?', args: [id] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// TEST ROOT
// ===================================================
app.get('/', (req, res) => {
  res.json({ status: '🚀 CRM Backend Running', engine: 'libSQL/Turso' });
});

// ===================================================
// START SERVER
// ===================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}

export default app; // For Vercel