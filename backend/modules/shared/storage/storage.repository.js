// modules/shared/storage/storage.repository.js
const pool = require('../../../config/db');

class StorageRepository {
  async getKeys(prefix) {
    const [rows] = await pool.query('SELECT `key` FROM storage WHERE `key` LIKE ?', [`${prefix}%`]);
    return rows.map(r => r.key);
  }

  async getValue(key) {
    const [rows] = await pool.query('SELECT `value` FROM storage WHERE `key` = ?', [key]);
    if (rows.length === 0) return null;
    return JSON.parse(rows[0].value);
  }

  async setValue(key, value) {
    const sql = `
      INSERT INTO storage (\`key\`, \`value\`) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)
    `;
    await pool.query(sql, [key, JSON.stringify(value)]);
  }

  async deleteValue(key) {
    await pool.query('DELETE FROM storage WHERE `key` = ?', [key]);
  }
}

module.exports = new StorageRepository();
