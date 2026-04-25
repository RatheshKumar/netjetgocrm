// config/db.js
const mysql = require('mysql2/promise');
const env   = require('./env');

const pool = mysql.createPool({
  host:     env.DB_HOST,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port:     env.DB_PORT,

  // Pool behaviour
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,

  // Safety & compatibility
  connectTimeout:    10000,  // 10 s — fail fast on unreachable host
  timezone:          'Z',    // store/read all datetimes in UTC
  namedPlaceholders: false,
});

/**
 * Run `fn(connection)` inside a transaction.
 * Commits on success, rolls back + re-throws on error.
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<any>} fn
 */
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = pool;
module.exports.withTransaction = withTransaction;
