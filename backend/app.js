// app.js - Modular Business OS Entry Point
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

// Import shared routes/middleware
const authRoutes = require('./modules/shared/auth/auth.routes');
const storageRoutes = require('./modules/shared/storage/storage.routes');
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);

// Module Routing
app.use('/api/hrm', require('./modules/hrm/routes'));
app.use('/api/erp', require('./modules/erp/routes'));
app.use('/api/crm', require('./modules/crm/routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: '🚀 Unified Business OS API is online', timestamp: new Date() });
});

// Serve frontend in production
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

module.exports = app;
