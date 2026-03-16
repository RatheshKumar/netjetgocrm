const fs = require('fs');

const filePath = 'c:\\Users\\rathe\\source\\repos\\netjetgocrm\\netjetgocrm\\server.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Dependencies and Setup
content = content.replace("const mysql = require('mysql2/promise');", "const { createClient } = require('@libsql/client');");

content = content.replace(/const dbConfig = {[\s\S]*?let pool;/m, `// libSQL connection configuration
let client;`);

const initDBReplacement = `async function initDB() {
  try {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:./crm.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    console.log('✅ Database connected.');`;

content = content.replace(/async function initDB\(\) {[\s\S]*?connectionLimit: 10\n    }\);/m, initDBReplacement);

// 2. Schema changes
// Replace ON UPDATE CURRENT_TIMESTAMP everywhere
content = content.replace(/ ON UPDATE CURRENT_TIMESTAMP/g, '');
// Replace INT AUTO_INCREMENT PRIMARY KEY
content = content.replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');

// Replace pool.query in initDB with client.execute
content = content.replace(/await pool\.query\(\`/g, 'await client.execute(`');

// 3. Sync Logic (syncToSpecializedTable)
content = content.replace(/await pool\.query\(\`DELETE FROM \$\{table\} WHERE id = \?\`, \[id\]\);/g, "await client.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });");

// Replace VALUES(k) with excluded.k
let syncLogicRegex = /const updates = keys\.map\(k => `\\\`\$\{k\}\\\` = VALUES\(\\\`\$\{k\}\\\`\)`\)\.join\(\', \'\);[\s\S]*?ON DUPLICATE KEY UPDATE \$\{updates\}\n    `;\n    \n    await pool\.query\(query, Object\.values\(validData\)\);/m;
let syncLogicReplacement = `const updates = keys.map(k => \`\\\`\${k}\\\` = excluded.\\\`\${k}\\\`\`).join(', ');

    const query = \`
      INSERT INTO \${table} (\${keys.map(k => \`\\\`\${k}\\\`\`).join(', ')})
      VALUES (\${placeholders})
      ON CONFLICT(id) DO UPDATE SET \${updates}
    \`;
    
    await client.execute({ sql: query, args: Object.values(validData) });`;

content = content.replace(syncLogicRegex, syncLogicReplacement);


// 4. API Endpoints
// GET /api/storage
content = content.replace(
  /const \[rows\] = await pool\.query\('SELECT `key` FROM storage WHERE `key` LIKE \?', \[`\$\{prefix\}%`\]\);\n    res\.json\(\{ keys: rows\.map\(r => r\.key\) \}\);/,
  `const result = await client.execute({ sql: 'SELECT \`key\` FROM storage WHERE \`key\` LIKE ?', args: [\`\${prefix}%\`] });
    res.json({ keys: result.rows.map(r => r.key) });`
);

// GET /api/storage/:key
content = content.replace(
  /const \[rows\] = await pool\.query\('SELECT `value` FROM storage WHERE `key` = \?', \[req\.params\.key\]\);\n    if \(rows\.length > 0\) {/,
  `const result = await client.execute({ sql: 'SELECT \`value\` FROM storage WHERE \`key\` = ?', args: [req.params.key] });
    if (result.rows.length > 0) {`
);
content = content.replace(/res\.json\(rows\[0\]\.value\);/, "res.json(result.rows[0].value);");

// POST /api/storage/:key
content = content.replace(
  /INSERT INTO storage \(`key`, `value`\)\n      VALUES \(\?, \?\)\n      ON DUPLICATE KEY UPDATE `value` = VALUES\(`value`\)/,
  `INSERT INTO storage (\`key\`, \`value\`)
      VALUES (?, ?)
      ON CONFLICT(\`key\`) DO UPDATE SET \`value\` = excluded.\`value\``
);
content = content.replace(
  /const \[result\] = await pool\.query\(query, \[key, JSON\.stringify\(value\)]\);/,
  "const result = await client.execute({ sql: query, args: [key, JSON.stringify(value)] });"
);
content = content.replace(/res\.json\(\{ success: true, affectedRows: result\.affectedRows \}\);/g, "res.json({ success: true, affectedRows: result.rowsAffected });");

// DELETE /api/storage/:key
content = content.replace(
  /const \[result\] = await pool\.query\('DELETE FROM storage WHERE `key` = \?', \[key\]\);/,
  "const result = await client.execute({ sql: 'DELETE FROM storage WHERE \`key\` = ?', args: [key] });"
);

// POST /api/logs/login
content = content.replace(
  /const \[result\] = await pool\.query\(query, \[userId \|\| null, email, system, ipAddress, userAgent\]\);/,
  "const result = await client.execute({ sql: query, args: [userId || null, email, system, ipAddress, userAgent] });"
);
content = content.replace(
  /res\.status\(201\)\.json\(\{ success: true, insertId: result\.insertId \}\);/,
  "res.status(201).json({ success: true, insertId: Number(result.lastInsertRowid) });" // libSQL uses lastInsertRowid
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Migration complete');
