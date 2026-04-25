// modules/shared/middleware/auth.middleware.js
const authService = require('../auth/auth.service');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('No token provided');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    err.status = 401;
    next(err);
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const err = new Error('Unauthorized role');
      err.status = 403;
      return next(err);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
