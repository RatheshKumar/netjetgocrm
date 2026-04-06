// config/schema.js
const pool = require('./db');

async function initSchema() {
  try {
    console.log('⏳ Initializing Unified Business OS Database Schema...');

    // ── Generic Storage (Legacy Frontend compatibility) ───────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS storage (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` LONGTEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Roles ────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_roles (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        permissions JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Departments ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_departments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        head VARCHAR(255),
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Employees ────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_employees (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Employee',
        department VARCHAR(100),
        phone VARCHAR(50),
        address TEXT,
        salary DECIMAL(15,2) DEFAULT 0,
        joinDate DATE,
        status VARCHAR(50) DEFAULT 'Active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Leave Requests ───────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_leaves (
        id VARCHAR(255) PRIMARY KEY,
        employeeId VARCHAR(255) NOT NULL,
        employeeName VARCHAR(255),
        leaveType VARCHAR(100) NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        days INT DEFAULT 1,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        approvedBy VARCHAR(255),
        approvedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Attendance ───────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_attendance (
        id VARCHAR(255) PRIMARY KEY,
        employeeId VARCHAR(255) NOT NULL,
        employeeName VARCHAR(255),
        date DATE NOT NULL,
        clockIn TIME,
        clockOut TIME,
        hoursWorked DECIMAL(4,2),
        status VARCHAR(50) DEFAULT 'Present',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Payroll ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_payroll (
        id VARCHAR(255) PRIMARY KEY,
        employeeId VARCHAR(255) NOT NULL,
        employeeName VARCHAR(255),
        month VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        basicPay DECIMAL(15,2) DEFAULT 0,
        allowances DECIMAL(15,2) DEFAULT 0,
        deductions DECIMAL(15,2) DEFAULT 0,
        netPay DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Pending',
        paidAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Leads ────────────────────────────────────────────────────────────
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

    // ── CRM: Contacts ─────────────────────────────────────────────────────────
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

    // ── CRM: Companies ────────────────────────────────────────────────────────
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

    // ── CRM: Tickets ──────────────────────────────────────────────────────────
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

    // ── CRM: Marketing Campaigns ──────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_campaigns (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        channel VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Draft',
        budget DECIMAL(15,2) DEFAULT 0,
        leads INT DEFAULT 0,
        startDate DATE,
        endDate DATE,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Collaboration: Announcements ──────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collab_announcements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        category VARCHAR(100) DEFAULT 'General',
        priority VARCHAR(50) DEFAULT 'Normal',
        isPinned TINYINT(1) DEFAULT 0,
        authorId VARCHAR(255),
        authorName VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Collaboration: Meetings ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collab_meetings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        meetingDate DATE NOT NULL,
        meetingTime TIME NOT NULL,
        duration INT DEFAULT 60,
        location VARCHAR(255),
        meetLink VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Scheduled',
        organizer VARCHAR(255),
        organizerId VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Collaboration: Knowledge Base ─────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collab_articles (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        category VARCHAR(100) DEFAULT 'General',
        tags VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Published',
        authorId VARCHAR(255),
        authorName VARCHAR(255),
        views INT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Collaboration: Discussion Rooms ───────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collab_discussions (
        id VARCHAR(255) PRIMARY KEY,
        roomName VARCHAR(255) NOT NULL,
        topic VARCHAR(255),
        message TEXT NOT NULL,
        authorId VARCHAR(255),
        authorName VARCHAR(255),
        parentId VARCHAR(255) DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ── HRM: Job Openings ─────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hrm_jobs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'Open',
        postedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Tasks/Operations ─────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_tasks (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Todo',
        priority VARCHAR(50) DEFAULT 'Normal',
        dueDate DATE,
        assignedTo VARCHAR(255),
        relatedTo VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Projects ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Planning',
        startDate DATE,
        endDate DATE,
        budget DECIMAL(15,2) DEFAULT 0,
        assignedTo VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Sales Pipelines ──────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_pipelines (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Client Contracts ─────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_contracts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        clientName VARCHAR(255),
        value DECIMAL(15,2) DEFAULT 0,
        startDate DATE,
        endDate DATE,
        status VARCHAR(50) DEFAULT 'Draft',
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Invoices ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_invoices (
        id VARCHAR(255) PRIMARY KEY,
        invoiceNumber VARCHAR(100) NOT NULL,
        clientName VARCHAR(255),
        amount DECIMAL(15,2) DEFAULT 0,
        tax DECIMAL(15,2) DEFAULT 0,
        total DECIMAL(15,2) DEFAULT 0,
        dueDate DATE,
        status VARCHAR(50) DEFAULT 'Draft',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Payments ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_payments (
        id VARCHAR(255) PRIMARY KEY,
        invoiceId VARCHAR(255),
        clientName VARCHAR(255),
        amount DECIMAL(15,2) DEFAULT 0,
        method VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Completed',
        paymentDate DATE,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── CRM: Products ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100),
        price DECIMAL(15,2) DEFAULT 0,
        stock INT DEFAULT 0,
        category VARCHAR(100),
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // ── Logs: Login Logs ──────────────────────────────────────────────────────
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

    console.log('✅ Unified CRM & HRM Database Schema initialized successfully.');
  } catch (err) {
    console.error('❌ Schema initialization error:', err.message);
  }
}

module.exports = { initSchema };
