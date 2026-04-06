// modules/hrm/services/employee.service.js
const employeeRepo = require('../repositories/employee.repository');
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

class EmployeeService {
  async listAllEmployees() {
    return await employeeRepo.getAll();
  }

  async getEmployeeProfile(id) {
    return await employeeRepo.getById(id);
  }

  async registerEmployee(data) {
    const { name, email, password, role, department } = data;
    const id = uuid();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await employeeRepo.create({
      id,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'Employee',
      department: department || 'General'
    });

    return { id, name, email };
  }

  // This service method can be used by other modules (e.g., CRM calling HRM)
  async getEmployeeName(id) {
    const emp = await employeeRepo.getById(id);
    return emp ? emp.name : 'Unknown';
  }

  async getManagers() {
    // Business logic to filtered managers (mocked)
    const all = await employeeRepo.getAll();
    return all.filter(e => e.role.includes('Manager'));
  }
  async removeEmployee(id) {
    await employeeRepo.delete(id);
    return { ok: true };
  }
}

module.exports = new EmployeeService();
