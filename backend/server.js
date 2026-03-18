// server.js
const app = require('./app');
const pool = require('./config/db');
const { initSchema } = require('./config/schema');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Basic connectivity check
    await pool.query('SELECT 1');
    console.log('✅ Connected to MySQL Database');
    
    await initSchema();

    app.listen(PORT, () => {
      console.log(`🚀 Unified Business OS started on port ${PORT}`);
      console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();