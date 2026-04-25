// modules/shared/auth/auth.service.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const employeeRepo = require('../../hrm/repositories/employee.repository');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

class AuthService {
  async authenticate(email, password) {
    const user = await employeeRepo.getByEmail(email);
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();
