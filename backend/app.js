// app.js - Unified CRM & HRM Business OS
const express = require('express');
const helmet  = require('helmet');
const compression = require('compression');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const env = require('./config/env'); // validates all required vars at startup
const { authenticate, authorize } = require('./modules/shared/middleware/auth.middleware');
const { requestLogger }  = require('./modules/shared/middleware/logger.middleware');
const { errorHandler }   = require('./modules/shared/middleware/error.middleware');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Production safety & optimization middlewares
app.use(helmet({
  contentSecurityPolicy: isProd ? undefined : false, // relax CSP in development
  crossOriginEmbedderPolicy: false // Allows third party images if needed
}));
app.use(compression());

// Fix #7: Strict CORS — only allow origins defined in ALLOWED_ORIGINS env var
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (e.g. curl, server-to-server) only in development
    if (!origin) {
      if (process.env.NODE_ENV === 'production') return callback(new Error('Origin required'), false);
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`), false);
  },
  credentials: true,
}));

app.use(express.json());
app.use(requestLogger); // structured request logging

// Shared modules
app.use('/api/auth',    require('./modules/shared/auth/auth.routes'));
app.use('/api/storage', require('./modules/shared/storage/storage.routes'));
app.use('/api/search',  authenticate, require('./modules/shared/search/search.routes'));
app.use('/api/ai',      authenticate, require('./modules/shared/ai/ai.routes'));
app.use('/api/ai/hr',   authenticate, require('./modules/shared/ai/hr-ai.routes'));

// CRM module - secure with specific authorized roles
const crmRoles = ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist', 'Support Agent', 'Project Manager', 'Accountant'];
app.use('/api/crm', authenticate, authorize(...crmRoles), require('./modules/crm/routes'));

// Fix #1 & #2: HRM requires authentication (any role)
app.use('/api/hrm', authenticate, require('./modules/hrm/routes'));

// Fix #1 & #2: Collab requires authentication (any role)
app.use('/api/collab', authenticate, require('./modules/collab/routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '🚀 NetJetGo CRM & HRM API is online', timestamp: new Date() });
});

// Fix #1 & #2: Dashboard requires authentication (any role)
app.get('/api/dashboard/stats', authenticate, async (req, res) => {
  try {
    const pool = require('./config/db');
    const [[leads]] = await pool.query(`SELECT COUNT(*) as total, SUM(value) as totalValue FROM crm_leads`);
    const [[tickets]] = await pool.query(`SELECT COUNT(*) as open FROM crm_tickets WHERE status='Open'`);
    const [[employees]] = await pool.query(`SELECT COUNT(*) as total FROM hrm_employees WHERE status='Active'`);
    const [[leaves]] = await pool.query(`SELECT COUNT(*) as pending FROM hrm_leaves WHERE status='Pending'`);
    const [[contacts]] = await pool.query(`SELECT COUNT(*) as total FROM crm_contacts`);

    // Tasks stats
    let taskFilter = '';
    let taskParams = [];
    if (req.user.role === 'Sales Representative' || req.user.role === 'Regular Employee') {
      taskFilter = ' AND assignedTo = ?';
      taskParams.push(req.user.name);
    }
    const [[tasksDue]] = await pool.query(`SELECT COUNT(*) as count FROM crm_tasks WHERE dueDate = CURDATE() AND status != 'Completed'${taskFilter}`, taskParams);
    const [[tasksOverdue]] = await pool.query(`SELECT COUNT(*) as count FROM crm_tasks WHERE dueDate < CURDATE() AND status != 'Completed'${taskFilter}`, taskParams);

    // Dynamic Activity Items
    const [latestLeads] = await pool.query(`SELECT name, createdAt FROM crm_leads ORDER BY createdAt DESC LIMIT 2`);
    const [latestTickets] = await pool.query(`SELECT subject, createdAt FROM crm_tickets ORDER BY createdAt DESC LIMIT 2`);
    const [latestAnnouncements] = await pool.query(`SELECT title, createdAt FROM collab_announcements ORDER BY createdAt DESC LIMIT 2`);
    const [latestEmployees] = await pool.query(`SELECT name, createdAt FROM hrm_employees ORDER BY createdAt DESC LIMIT 2`);

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

    const [[payrollStats]] = await pool.query(`SELECT SUM(netPay) as total FROM hrm_payroll WHERE status='Paid'`);

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

    res.json({ 
      leads, 
      tickets, 
      employees, 
      leaves, 
      contacts, 
      leadSources, 
      ticketStatuses, 
      leadGrowth, 
      deptHeadcount, 
      payrollTotal: payrollStats?.total || 0,
      tasksDue: tasksDue?.count || 0,
      tasksOverdue: tasksOverdue?.count || 0,
      latestLeads,
      latestTickets,
      latestAnnouncements,
      latestEmployees
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve React frontend in production
const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath, {
  maxAge: isProd ? '1d' : 0, // cache static assets for 1 day in prod
  setHeaders: (res, filePath) => {
    // Avoid caching the entry point so users always get the latest bundle map
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Central error handler — MUST be last
app.use(errorHandler);

module.exports = app;
