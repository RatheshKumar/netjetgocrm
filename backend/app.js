// app.js - Unified CRM & HRM Business OS
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Shared modules
app.use('/api/auth',    require('./modules/shared/auth/auth.routes'));
app.use('/api/storage', require('./modules/shared/storage/storage.routes'));

// CRM module
app.use('/api/crm', require('./modules/crm/routes'));

// HRM module
app.use('/api/hrm', require('./modules/hrm/routes'));

// Collaboration module
app.use('/api/collab', require('./modules/collab/routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '🚀 NetJetGo CRM & HRM API is online', timestamp: new Date() });
});

// Dashboard aggregate stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const pool = require('./config/db');
    const [[leads]] = await pool.query(`SELECT COUNT(*) as total, SUM(value) as totalValue FROM crm_leads`);
    const [[tickets]] = await pool.query(`SELECT COUNT(*) as open FROM crm_tickets WHERE status='Open'`);
    const [[employees]] = await pool.query(`SELECT COUNT(*) as total FROM hrm_employees WHERE status='Active'`);
    const [[leaves]] = await pool.query(`SELECT COUNT(*) as pending FROM hrm_leaves WHERE status='Pending'`);
    const [[contacts]] = await pool.query(`SELECT COUNT(*) as total FROM crm_contacts`);

    // Additional data for robust charts
    const [leadSourcesRaw] = await pool.query(`
      SELECT IFNULL(NULLIF(source, ''), 'Direct/Other') as name, COUNT(*) as value 
      FROM crm_leads 
      GROUP BY name
    `);
    
    // Make sure we have proper integer typing for recharts Pie
    const leadSources = leadSourcesRaw.map(r => ({ name: r.name, value: Number(r.value) }));
    
    const [ticketStatusesRaw] = await pool.query(`
      SELECT status as name, COUNT(*) as value 
      FROM crm_tickets 
      GROUP BY status
    `);
    const ticketStatuses = ticketStatusesRaw.map(r => ({ name: r.name, value: Number(r.value) }));
    
    // HRM Stats for Reports
    const [deptHeadcountRaw] = await pool.query(`
      SELECT dept as name, COUNT(*) as value 
      FROM hrm_employees 
      WHERE status='Active'
      GROUP BY dept
    `);
    const deptHeadcount = deptHeadcountRaw.map(r => ({ name: r.name || 'Unassigned', value: Number(r.value) }));

    const [[payrollStats]] = await pool.query(`SELECT SUM(netSalary) as total FROM hrm_payroll WHERE status='Paid'`);

    // Growth Trend
    const [leadGrowthRaw] = await pool.query(`
      SELECT DATE_FORMAT(createdAt, '%b %Y') as monthName, COUNT(*) as leads, SUM(value) as revenue 
      FROM crm_leads 
      GROUP BY monthName 
      ORDER BY MIN(createdAt) ASC
      LIMIT 8
    `);
    
    let leadGrowth = leadGrowthRaw.map(r => ({ monthName: r.monthName, leads: Number(r.leads), revenue: Number(r.revenue) }));

    // Fallbacks if db is completely empty so UI charts still render beautifully initially
    if (!leadGrowth || leadGrowth.length === 0) {
      leadGrowth = [
        { monthName: 'Oct', leads: 4, revenue: 15000 },
        { monthName: 'Nov', leads: 7, revenue: 25000 },
        { monthName: 'Dec', leads: 12, revenue: 42000 },
        { monthName: 'Jan', leads: 18, revenue: 58000 },
        { monthName: 'Feb', leads: 24, revenue: 75000 },
        { monthName: 'Mar', leads: 31, revenue: 110000 },
      ];
    }
    if (!leadSources || leadSources.length === 0) {
      leadSources.push({ name: 'Website', value: 45 }, { name: 'Referral', value: 30 }, { name: 'Organic', value: 25 });
    }
    if (!ticketStatuses || ticketStatuses.length === 0) {
      ticketStatuses.push({ name: 'Open', value: 12 }, { name: 'In Progress', value: 8 }, { name: 'Closed', value: 35 });
    }

    res.json({ leads, tickets, employees, leaves, contacts, leadSources, ticketStatuses, leadGrowth, deptHeadcount, payrollTotal: payrollStats?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React frontend in production
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

module.exports = app;
