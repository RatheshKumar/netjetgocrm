// modules/shared/utils/response.js
// Standardised API response envelope: { success, data?, error? }

/**
 * Send a successful response.
 * @param {import('express').Response} res
 * @param {*} data   - payload to send
 * @param {number} [status=200]
 */
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string|Error} error
 * @param {number} [status=400]
 */
function fail(res, error, status = 400) {
  const message = error instanceof Error ? error.message : String(error);
  return res.status(status).json({ success: false, error: message });
}

module.exports = { ok, fail };
