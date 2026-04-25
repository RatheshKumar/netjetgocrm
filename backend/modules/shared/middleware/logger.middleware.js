// modules/shared/middleware/logger.middleware.js
// Lightweight request logger. No external deps.

const env = require('../../../config/env');

/**
 * Request logger — logs every completed HTTP request:
 *   [HH:MM:SS] METHOD /path → STATUS (Xms)
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const ms      = Date.now() - start;
    const time    = new Date().toLocaleTimeString();
    const status  = res.statusCode;
    const colour  = status >= 500 ? '\x1b[31m'   // red
                  : status >= 400 ? '\x1b[33m'   // yellow
                  : status >= 300 ? '\x1b[36m'   // cyan
                  :                 '\x1b[32m';  // green
    const reset   = '\x1b[0m';

    // In production strip colour codes (logs may go to a file aggregator)
    if (env.isProd) {
      console.log(`[${time}] ${req.method} ${req.originalUrl} → ${status} (${ms}ms)`);
    } else {
      console.log(`[${time}] ${req.method} ${req.originalUrl} ${colour}→ ${status}${reset} (${ms}ms)`);
    }
  });

  next();
}

module.exports = { requestLogger };
