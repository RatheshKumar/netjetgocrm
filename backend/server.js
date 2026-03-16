const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection configuration
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Root@12345',
  port: 3306
};

let pool;

// ===================================================
// Initialize Database & Tables
// ===================================================
async function initDB() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query('CREATE DATABASE IF NOT EXISTS netjetgocrm_db');
    console.log('✅ Database "netjetgocrm_db" ready.');
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: 'netjetgocrm_db',
      waitForConnections: true,
      connectionLimit: 10
    });

    // ── Generic key-value storage (used by frontend storage.js) ──────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS storage (
        \`key\`    VARCHAR(255) PRIMARY KEY,
        \`value\`  JSON         NOT NULL,
        createdAt DATETIME     DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: storage');

    // ── CRM: Users ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_users (
        id        VARCHAR(36)  PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        email     VARCHAR(255) NOT NULL UNIQUE,
        password  VARCHAR(255),
        role      VARCHAR(100),
        createdAt DATETIME     DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: crm_users');

    // ── CRM: Companies ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id        VARCHAR(36)  PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        industry  VARCHAR(100),
        website   VARCHAR(255),
        email     VARCHAR(255),
        phone     VARCHAR(50),
        address   TEXT,
        size      VARCHAR(50),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: companies');

    // ── CRM: Contacts ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id        VARCHAR(36)  PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        email     VARCHAR(255),
        phone     VARCHAR(50),
        jobTitle  VARCHAR(150),
        company   VARCHAR(255),
        notes     TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: contacts');

    // ── CRM: Leads ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id        VARCHAR(36)   PRIMARY KEY,
        name      VARCHAR(255)  NOT NULL,
        company   VARCHAR(255),
        email     VARCHAR(255),
        phone     VARCHAR(50),
        status    VARCHAR(50)   DEFAULT 'Pending',
        value     DECIMAL(15,2) DEFAULT 0,
        owner     VARCHAR(255),
        source    VARCHAR(100),
        notes     TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: leads');

    // ── CRM: Contracts ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contracts (
        id           VARCHAR(36)   PRIMARY KEY,
        title        VARCHAR(255)  NOT NULL,
        client       VARCHAR(255),
        type         VARCHAR(100),
        status       VARCHAR(50)   DEFAULT 'Draft',
        value        DECIMAL(15,2) DEFAULT 0,
        startDate    DATE,
        endDate      DATE,
        notes        TEXT,
        createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: contracts');

    // ── CRM: Invoices ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id          VARCHAR(36)   PRIMARY KEY,
        invoiceNo   VARCHAR(100),
        client      VARCHAR(255),
        status      VARCHAR(50)   DEFAULT 'Draft',
        amount      DECIMAL(15,2) DEFAULT 0,
        dueDate     DATE,
        issuedDate  DATE,
        notes       TEXT,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: invoices');

    // ── CRM: Payments ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id        VARCHAR(36)   PRIMARY KEY,
        client    VARCHAR(255),
        invoiceNo VARCHAR(100),
        amount    DECIMAL(15,2) DEFAULT 0,
        method    VARCHAR(100),
        date      DATE,
        notes     TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: payments');

    // ── CRM: Tasks ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          VARCHAR(36)  PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        status      VARCHAR(50)  DEFAULT 'Todo',
        priority    VARCHAR(50)  DEFAULT 'Medium',
        dueDate     DATE,
        assignedTo  VARCHAR(255),
        relatedTo   VARCHAR(255),
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: tasks');

    // ── CRM: Pipeline ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pipelines (
        id        VARCHAR(36)   PRIMARY KEY,
        name      VARCHAR(255)  NOT NULL,
        stage     VARCHAR(100),
        status    VARCHAR(50)   DEFAULT 'Active',
        value     DECIMAL(15,2) DEFAULT 0,
        company   VARCHAR(255),
        contact   VARCHAR(255),
        owner     VARCHAR(255),
        closeDate DATE,
        notes     TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: pipelines');

    // ── CRM: Products ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          VARCHAR(36)   PRIMARY KEY,
        name        VARCHAR(255)  NOT NULL,
        category    VARCHAR(100),
        price       DECIMAL(15,2) DEFAULT 0,
        description TEXT,
        sku         VARCHAR(100),
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: products');

    // ── CRM: Projects ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          VARCHAR(36)  PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        client      VARCHAR(255),
        status      VARCHAR(50)  DEFAULT 'Planning',
        startDate   DATE,
        endDate     DATE,
        budget      DECIMAL(15,2),
        description TEXT,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: projects');

    // ── CRM: Tickets ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id          VARCHAR(36)  PRIMARY KEY,
        subject     VARCHAR(255) NOT NULL,
        client      VARCHAR(255),
        status      VARCHAR(50)  DEFAULT 'Open',
        priority    VARCHAR(50)  DEFAULT 'Normal',
        description TEXT,
        assignedTo  VARCHAR(255),
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: tickets');

    // ── ERP: Users ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_users (
        id        VARCHAR(36)  PRIMARY KEY,
        name      VARCHAR(255) NOT NULL,
        email     VARCHAR(255) NOT NULL UNIQUE,
        password  VARCHAR(255),
        role      VARCHAR(100),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_users');

    // ── ERP: Inventory ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_inventory (
        id                VARCHAR(36)   PRIMARY KEY,
        name              VARCHAR(255)  NOT NULL,
        sku               VARCHAR(100),
        category          VARCHAR(100),
        description       TEXT,
        costPrice         DECIMAL(15,2) DEFAULT 0,
        sellingPrice      DECIMAL(15,2) DEFAULT 0,
        stock             INT           DEFAULT 0,
        lowStockThreshold INT           DEFAULT 5,
        unit              VARCHAR(50)   DEFAULT 'pcs',
        supplier          VARCHAR(255),
        createdAt         DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_inventory');

    // ── ERP: Suppliers ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_suppliers (
        id          VARCHAR(36)  PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255),
        phone       VARCHAR(50),
        address     TEXT,
        contactName VARCHAR(255),
        status      VARCHAR(50)  DEFAULT 'Active',
        notes       TEXT,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_suppliers');

    // ── ERP: Purchases ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_purchases (
        id           VARCHAR(36)   PRIMARY KEY,
        poNumber     VARCHAR(100),
        supplier     VARCHAR(255),
        status       VARCHAR(50)   DEFAULT 'Draft',
        totalAmount  DECIMAL(15,2) DEFAULT 0,
        orderDate    DATE,
        expectedDate DATE,
        items        JSON,
        notes        TEXT,
        createdAt    DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_purchases');

    // ── ERP: Employees ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_employees (
        id          VARCHAR(36)  PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        email       VARCHAR(255),
        phone       VARCHAR(50),
        jobTitle    VARCHAR(150),
        department  VARCHAR(100),
        status      VARCHAR(50)  DEFAULT 'Active',
        salary      DECIMAL(15,2) DEFAULT 0,
        joinDate    DATE,
        address     TEXT,
        createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_employees');

    // ── ERP: Payroll ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_payroll (
        id            VARCHAR(36)   PRIMARY KEY,
        employeeId    VARCHAR(36),
        employeeName  VARCHAR(255),
        month         VARCHAR(20),
        basicSalary   DECIMAL(15,2) DEFAULT 0,
        allowances    DECIMAL(15,2) DEFAULT 0,
        deductions    DECIMAL(15,2) DEFAULT 0,
        netPay        DECIMAL(15,2) DEFAULT 0,
        status        VARCHAR(50)   DEFAULT 'Pending',
        paymentMethod VARCHAR(100),
        paidOn        DATE,
        createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_payroll');

    // ── ERP: POS Sales ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_pos_sales (
        id            VARCHAR(36)   PRIMARY KEY,
        saleNo        VARCHAR(100),
        items         JSON,
        subtotal      DECIMAL(15,2) DEFAULT 0,
        tax           DECIMAL(15,2) DEFAULT 0,
        discount      DECIMAL(15,2) DEFAULT 0,
        total         DECIMAL(15,2) DEFAULT 0,
        paymentMethod VARCHAR(100),
        cashier       VARCHAR(255),
        customerName  VARCHAR(255),
        createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: erp_pos_sales');

    // ── System: Login Logs ────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        userId      VARCHAR(36),
        email       VARCHAR(255) NOT NULL,
        \`system\`      VARCHAR(50)  NOT NULL, 
        ipAddress   VARCHAR(45),
        userAgent   TEXT,
        loginAt     DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table: login_logs');

    console.log('\n🎉 All tables initialized successfully in netjetgocrm_db!');

  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    process.exit(1);
  }
}

initDB();


// ===================================================
// Root route
// ===================================================

app.get('/', (req, res) => {
  res.send('🚀 NetJetGo CRM Backend Running');
});


// ===================================================
// Generic Storage API (used by frontend)
// ===================================================

// GET keys by prefix
app.get('/api/storage', async (req, res) => {
  const prefix = req.query.prefix;
  if (!prefix) return res.status(400).json({ error: 'Prefix is required' });
  try {
    const [rows] = await pool.query('SELECT `key` FROM storage WHERE `key` LIKE ?', [`${prefix}%`]);
    res.json({ keys: rows.map(r => r.key) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET single record
app.get('/api/storage/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `value` FROM storage WHERE `key` = ?', [req.params.key]);
    if (rows.length > 0) {
      res.json(rows[0].value);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create or update
app.post('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  const value = req.body;
  try {
    const query = `
      INSERT INTO storage (\`key\`, \`value\`)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
    `;
    const [result] = await pool.query(query, [key, JSON.stringify(value)]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE record
app.delete('/api/storage/:key', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM storage WHERE `key` = ?', [req.params.key]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// ===================================================
// Logs API
// ===================================================

app.post('/api/logs/login', async (req, res) => {
  const { userId, email, system } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  if (!email || !system) {
    return res.status(400).json({ error: 'Email and system are required' });
  }

  try {
    const query = `
      INSERT INTO login_logs (userId, email, \`system\`, ipAddress, userAgent)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [userId || null, email, system, ipAddress, userAgent]);
    res.status(201).json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error('Error logging login:', err);
    res.status(500).json({ error: 'Failed to record login' });
  }
});


// ===================================================
// Start server
// ===================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});