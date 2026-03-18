// config/schema.js
const pool = require('./db');

async function initSchema() {
  try {
    console.log('⏳ Initializing Unified Business OS Database Schema...');

    // Generic Storage (Legacy Frontend compatibility)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS storage (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // HRM: Roles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        permissions JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // HRM: Employees (Replacement for crm_users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        department VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // CRM: Leads (Merged Legacy + Modular)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_leads (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'New',
        value DECIMAL(15,2) DEFAULT 0,
        assignedTo VARCHAR(255),
        source VARCHAR(255),
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // CRM: Contacts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_contacts (
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

    // CRM: Companies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_companies (
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

    // CRM: Tickets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_tickets (
        id VARCHAR(255) PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'Normal',
        status VARCHAR(50) DEFAULT 'Open',
        assignedTo VARCHAR(255),
        source VARCHAR(50) DEFAULT 'CRM',
        shopName VARCHAR(255),
        submitterEmail VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Logs: Login Logs
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

    // ERP: Products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS erp_products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        stock INT DEFAULT 0,
        price DECIMAL(15,2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database Schema initialized.');
  } catch (err) {
    console.error('❌ Schema initialization error:', err.message);
  }
}

module.exports = { initSchema };
