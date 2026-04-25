require('dotenv').config();
const pool = require('./backend/config/db');

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE crm_leads 
      ADD COLUMN lead_score INT DEFAULT 0,
      ADD COLUMN lead_status VARCHAR(20) DEFAULT 'COLD'
    `);
    console.log('✅ Columns added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Migration error:', err);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
