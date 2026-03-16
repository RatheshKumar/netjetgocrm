const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ===================================================
// Turso / libSQL Connection
// ===================================================
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./crm.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Initialize all tables if they don't exist.
 * In a serverless environment, this runs on cold start.
 */
async function initDB() {
  try {
    console.log('⏳ Initializing database tables...');

    // Generic key-value storage
    await client.execute(`
      CREATE TABLE IF NOT EXISTS storage (
        "key"    TEXT PRIMARY KEY,
        "value"  TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // CRM Tables
    const crmTables = [
      `CREATE TABLE IF NOT EXISTS crm_users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT, role TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, industry TEXT, website TEXT, email TEXT, phone TEXT, address TEXT, size TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT, jobTitle TEXT, company TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, company TEXT, email TEXT, phone TEXT, status TEXT DEFAULT 'Pending', value DECIMAL(15,2) DEFAULT 0, owner TEXT, source TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS contracts (id TEXT PRIMARY KEY, title TEXT NOT NULL, client TEXT, type TEXT, status TEXT DEFAULT 'Draft', value DECIMAL(15,2) DEFAULT 0, startDate TEXT, endDate TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS invoices (id TEXT PRIMARY KEY, invoiceNo TEXT, client TEXT, status TEXT DEFAULT 'Draft', amount DECIMAL(15,2) DEFAULT 0, dueDate TEXT, issuedDate TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, client TEXT, invoiceNo TEXT, amount DECIMAL(15,2) DEFAULT 0, method TEXT, date TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'Todo', priority TEXT DEFAULT 'Medium', dueDate TEXT, assignedTo TEXT, relatedTo TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS pipelines (id TEXT PRIMARY KEY, name TEXT NOT NULL, stage TEXT, status TEXT DEFAULT 'Active', value DECIMAL(15,2) DEFAULT 0, company TEXT, contact TEXT, owner TEXT, closeDate TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, price DECIMAL(15,2) DEFAULT 0, description TEXT, sku TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, client TEXT, status TEXT DEFAULT 'Planning', startDate TEXT, endDate TEXT, budget DECIMAL(15,2), description TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS tickets (id TEXT PRIMARY KEY, subject TEXT NOT NULL, client TEXT, status TEXT DEFAULT 'Open', priority TEXT DEFAULT 'Normal', description TEXT, assignedTo TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`
    ];

    // ERP Tables
    const erpTables = [
      `CREATE TABLE IF NOT EXISTS erp_users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT, role TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_inventory (id TEXT PRIMARY KEY, name TEXT NOT NULL, sku TEXT, category TEXT, description TEXT, costPrice DECIMAL(15,2) DEFAULT 0, sellingPrice DECIMAL(15,2) DEFAULT 0, stock INTEGER DEFAULT 0, lowStockThreshold INTEGER DEFAULT 5, unit TEXT DEFAULT 'pcs', supplier TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_suppliers (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT, address TEXT, contactName TEXT, status TEXT DEFAULT 'Active', notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_purchases (id TEXT PRIMARY KEY, poNumber TEXT, supplier TEXT, status TEXT DEFAULT 'Draft', totalAmount DECIMAL(15,2) DEFAULT 0, orderDate TEXT, expectedDate TEXT, items TEXT, notes TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_employees (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT, jobTitle TEXT, department TEXT, status TEXT DEFAULT 'Active', salary DECIMAL(15,2) DEFAULT 0, joinDate TEXT, address TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_payroll (id TEXT PRIMARY KEY, employeeId TEXT, employeeName TEXT, month TEXT, basicSalary DECIMAL(15,2) DEFAULT 0, allowances DECIMAL(15,2) DEFAULT 0, deductions DECIMAL(15,2) DEFAULT 0, netPay DECIMAL(15,2) DEFAULT 0, status TEXT DEFAULT 'Pending', paymentMethod TEXT, paidOn TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      `CREATE TABLE IF NOT EXISTS erp_pos_sales (id TEXT PRIMARY KEY, saleNo TEXT, items TEXT, subtotal DECIMAL(15,2) DEFAULT 0, tax DECIMAL(15,2) DEFAULT 0, discount DECIMAL(15,2) DEFAULT 0, total DECIMAL(15,2) DEFAULT 0, paymentMethod TEXT, cashier TEXT, customerName TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`
    ];

    // System Tables
    const systemTables = [
      `CREATE TABLE IF NOT EXISTS login_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT, email TEXT NOT NULL, system TEXT NOT NULL, ipAddress TEXT, userAgent TEXT, loginAt DATETIME DEFAULT CURRENT_TIMESTAMP)`
    ];

    for (const sql of [...crmTables, ...erpTables, ...systemTables]) {
      await client.execute(sql);
    }

    console.log('✅ Database initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

// Global initialization
initDB();

// ===================================================
// TABLE MAPPINGS for Synchronization
// ===================================================
const TABLE_MAPPING = {
  'contacts:':     { table: 'contacts',      cols: ['id', 'name', 'email', 'phone', 'jobTitle', 'company', 'notes', 'createdAt', 'updatedAt'] },
  'companies:':    { table: 'companies',     cols: ['id', 'name', 'industry', 'website', 'email', 'phone', 'address', 'size', 'createdAt', 'updatedAt'] },
  'leads:':        { table: 'leads',         cols: ['id', 'name', 'company', 'email', 'phone', 'status', 'value', 'owner', 'source', 'notes', 'createdAt', 'updatedAt'] },
  'contracts:':    { table: 'contracts',     cols: ['id', 'title', 'client', 'type', 'status', 'value', 'startDate', 'endDate', 'notes', 'createdAt', 'updatedAt'] },
  'invoices:':     { table: 'invoices',      cols: ['id', 'invoiceNo', 'client', 'status', 'amount', 'dueDate', 'issuedDate', 'notes', 'createdAt', 'updatedAt'] },
  'payments:':     { table: 'payments',      cols: ['id', 'client', 'invoiceNo', 'amount', 'method', 'date', 'notes', 'createdAt', 'updatedAt'] },
  'tasks:':        { table: 'tasks',         cols: ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'relatedTo', 'createdAt', 'updatedAt'] },
  'pipelines:':    { table: 'pipelines',     cols: ['id', 'name', 'stage', 'status', 'value', 'company', 'contact', 'owner', 'closeDate', 'notes', 'createdAt', 'updatedAt'] },
  'products:':     { table: 'products',      cols: ['id', 'name', 'category', 'price', 'description', 'sku', 'createdAt', 'updatedAt'] },
  'projects:':     { table: 'projects',      cols: ['id', 'name', 'client', 'status', 'startDate', 'endDate', 'budget', 'description', 'createdAt', 'updatedAt'] },
  'tickets:':      { table: 'tickets',       cols: ['id', 'subject', 'client', 'status', 'priority', 'description', 'assignedTo', 'createdAt', 'updatedAt'] },
  'erp_inventory:':{ table: 'erp_inventory', cols: ['id', 'name', 'sku', 'category', 'description', 'costPrice', 'sellingPrice', 'stock', 'lowStockThreshold', 'unit', 'supplier', 'createdAt', 'updatedAt'] },
  'erp_suppliers:':{ table: 'erp_suppliers', cols: ['id', 'name', 'email', 'phone', 'address', 'contactName', 'status', 'notes', 'createdAt', 'updatedAt'] },
  'erp_purchases:':{ table: 'erp_purchases', cols: ['id', 'poNumber', 'supplier', 'status', 'totalAmount', 'orderDate', 'expectedDate', 'items', 'notes', 'createdAt', 'updatedAt'] },
  'erp_employees:':{ table: 'erp_employees', cols: ['id', 'name', 'email', 'phone', 'jobTitle', 'department', 'status', 'salary', 'joinDate', 'address', 'createdAt', 'updatedAt'] },
  'erp_payroll:':  { table: 'erp_payroll',   cols: ['id', 'employeeId', 'employeeName', 'month', 'basicSalary', 'allowances', 'deductions', 'netPay', 'status', 'paymentMethod', 'paidOn', 'createdAt', 'updatedAt'] },
  'erp_pos_sales:':{ table: 'erp_pos_sales', cols: ['id', 'saleNo', 'items', 'subtotal', 'tax', 'discount', 'total', 'paymentMethod', 'cashier', 'customerName', 'createdAt'] },
  'users:':        { table: 'crm_users',     cols: ['id', 'name', 'email', 'password', 'role', 'createdAt', 'updatedAt'] },
  'erp_users:':    { table: 'erp_users',     cols: ['id', 'name', 'email', 'password', 'role', 'createdAt', 'updatedAt'] },
};

async function syncToSpecializedTable(key, value, isDelete = false) {
  const prefix = Object.keys(TABLE_MAPPING).find(p => key.startsWith(p));
  if (!prefix) return;

  const { table, cols } = TABLE_MAPPING[prefix];
  const id = key.replace(prefix, '');

  if (isDelete) {
    try {
      await client.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    } catch (err) {
      console.warn(`[sync] Delete failed for ${table}:`, err.message);
    }
    return;
  }

  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    if (!data.id) data.id = id;
    
    // SQLite manual updatedAt update
    data.updatedAt = new Date().toISOString();

    const validData = cols.reduce((acc, col) => {
      if (data[col] !== undefined && data[col] !== null) {
        acc[col] = (typeof data[col] === 'object') ? JSON.stringify(data[col]) : data[col];
      }
      return acc;
    }, {});

    const keys = Object.keys(validData);
    if (keys.length === 0) return;

    const placeholders = keys.map(() => '?').join(', ');
    const updates = keys.map(k => `"${k}" = excluded."${k}"`).join(', ');

    const sql = `
      INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(', ')})
      VALUES (${placeholders})
      ON CONFLICT(id) DO UPDATE SET ${updates}
    `;
    
    await client.execute({ sql, args: Object.values(validData) });
  } catch (err) {
    console.warn(`[sync] Sync failed for ${table}:`, err.message);
  }
}

// ===================================================
// API ROUTES
// ===================================================

app.get('/', (req, res) => res.json({ status: '🚀 Cloud Backend Running', engine: 'libSQL/Turso' }));

// ── GENERIC STORAGE API ─────────────────────────────
// GET all keys by prefix
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

// GET single record
app.get('/api/storage/:key', async (req, res) => {
  try {
    const result = await client.execute({ sql: 'SELECT "value" FROM storage WHERE "key" = ?', args: [req.params.key] });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(JSON.parse(result.rows[0].value));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save record
app.post('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  const value = req.body;
  try {
    const sql = `INSERT INTO storage ("key", "value") VALUES (?, ?) ON CONFLICT("key") DO UPDATE SET "value" = excluded."value"`;
    await client.execute({ sql, args: [key, JSON.stringify(value)] });
    await syncToSpecializedTable(key, value);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE record
app.delete('/api/storage/:key', async (req, res) => {
  const { key } = req.params;
  try {
    await client.execute({ sql: 'DELETE FROM storage WHERE "key" = ?', args: [key] });
    await syncToSpecializedTable(key, null, true);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN LOGS ────────────────────────────────────
app.post('/api/logs/login', async (req, res) => {
  const { userId, email, system } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.get('User-Agent');
  try {
    const sql = `INSERT INTO login_logs (userId, email, system, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)`;
    const result = await client.execute({ sql, args: [userId || null, email, system, ipAddress, userAgent] });
    res.status(201).json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===================================================
// Start Server
// ===================================================
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

module.exports = app; // Required for Vercel