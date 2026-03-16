const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection configuration
// User needs to update these with their actual MySQL credentials
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password', // TODO: user should update this
};

let pool;

async function initDB() {
  try {
    // 1. Connect without database selected to create it if it doesn't exist
    const connection = await mysql.createConnection(dbConfig);
    await connection.query('CREATE DATABASE IF NOT EXISTS netjetgocrm_db');
    console.log('Database "netjetgocrm_db" ready.');
    await connection.end();

    // 2. Create a connection pool attached to our database
    pool = mysql.createPool({
      ...dbConfig,
      database: 'netjetgocrm_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Create the generic Key-Value store table to mirror window.storage format
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS storage (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` JSON NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await pool.query(createTableQuery);
    console.log('Storage table ready for MySQL.');
  } catch (err) {
    console.error('Error initializing MySQL database:', err.message);
    process.exit(1);
  }
}

// Call the DB initialization
initDB();

// =============================================================================
// API Endpoints for Key-Value Storage
// =============================================================================

// GET all records for a given prefix (e.g., "companies:")
app.get('/api/storage', async (req, res) => {
  const prefix = req.query.prefix;
  if (!prefix) {
    return res.status(400).json({ error: 'Prefix is required' });
  }

  try {
    // We use a wildcard % matching starting at the prefix
    const query = 'SELECT `key` FROM storage WHERE `key` LIKE ?';
    const [rows] = await pool.query(query, [`${prefix}%`]);
    // Send back array of keys matching prefix
    const keys = rows.map(r => r.key);
    res.json({ keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET a specific record
app.get('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  try {
    const query = 'SELECT `value` FROM storage WHERE `key` = ?';
    const [rows] = await pool.query(query, [key]);
    if (rows.length > 0) {
      // Return value natively (it's stored as JSON datatype in MySQL)
      res.json({ value: JSON.stringify(rows[0].value) }); 
    } else {
      res.json(null); // Not found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST (Create or Update) a record
app.post('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  // Convert body back to JS objects and let mysql2 handle JSON serialization
  const value = req.body; 

  try {
    // MySQL 8+ syntax for Insert or Update (upsert)
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

// DELETE a record
app.delete('/api/storage/:key', async (req, res) => {
  const key = req.params.key;
  try {
    const query = 'DELETE FROM storage WHERE `key` = ?';
    const [result] = await pool.query(query, [key]);
    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 MySQL Backend server running on http://localhost:${PORT}`);
});
