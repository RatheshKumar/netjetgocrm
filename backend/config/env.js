// config/env.js — centralised environment validation
// Imported ONCE at the top of db.js, app.js, and auth.service.js.
// Will crash at startup (process.exit(1)) if any required var is missing.

const REQUIRED = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'ALLOWED_ORIGINS',
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ FATAL: Missing required environment variables:');
  missing.forEach((key) => console.error(`   • ${key}`));
  console.error('Set them in your .env file and restart the server.');
  process.exit(1);
}

const env = Object.freeze({
  // Database
  DB_HOST:     process.env.DB_HOST,
  DB_USER:     process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME:     process.env.DB_NAME,
  DB_PORT:     parseInt(process.env.DB_PORT || '3306', 10),

  // Auth
  JWT_SECRET:  process.env.JWT_SECRET,

  // Server
  PORT:             parseInt(process.env.PORT || '3001', 10),
  NODE_ENV:         process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS:  process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),

  // Helpers
  get isProd() { return this.NODE_ENV === 'production'; },
  get isDev()  { return !this.isProd; },
});

module.exports = env;
