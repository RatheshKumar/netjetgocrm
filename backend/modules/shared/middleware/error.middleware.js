// modules/shared/middleware/error.middleware.js
// Central Express error handler — must be registered LAST in app.js.
// Signature: (err, req, res, next) — 4 args required by Express.

const env = require('../../../config/env');

// Map well-known error messages → HTTP status codes
function resolveStatus(err) {
  if (err.status) return err.status;
  const msg = err.message || '';
  if (msg.includes('No token')   || msg.includes('token provided'))   return 401;
  if (msg.includes('Invalid or expired token'))                        return 401;
  if (msg.includes('Unauthorized role') || msg.includes('Access denied')) return 403;
  if (msg.includes('not found') || msg.includes('Not found'))          return 404;
  if (msg.includes('CORS'))                                            return 403;
  return 500;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = resolveStatus(err);

  // Always log server errors with full context
  if (status >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}`);
    console.error(err.stack || err.message);
  } else {
    // 4xx: log as warning in dev only
    if (env.isDev) {
      console.warn(`[WARN]  ${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
    }
  }

  const body = { success: false, error: err.message || 'Internal server error' };

  // Expose stack trace only in development
  if (env.isDev && status >= 500) {
    body.stack = err.stack;
  }

  return res.status(status).json(body);
}

module.exports = { errorHandler };
