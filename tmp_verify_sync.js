const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'Root@12345',
  port: 3306,
  database: 'netjetgocrm_db'
};

async function check() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to DB');
    
    console.log('\n--- Checking storage table ---');
    const [storageRows] = await connection.query('SELECT * FROM storage WHERE `key` = "contacts:test-sync-v1"');
    console.log(storageRows);

    console.log('\n--- Checking contacts table ---');
    const [contactRows] = await connection.query('SELECT * FROM contacts WHERE id = "test-sync-v1"');
    console.log(contactRows);
    
    await connection.end();
  } catch (err) {
    console.error('Error details:', err);
  }
}

check();
