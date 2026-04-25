const pool = require('../../../config/db');
const { ok } = require('../utils/response');

class SearchController {
  async globalSearch(req, res, next) {
    try {
      const q = req.query.q || '';
      if (!q.trim() || q.length < 2) return ok(res, []);

      const searchStr = `%${q}%`;

      // Run parallel partial-match queries
      const [
        [contacts],
        [leads],
        [employees]
      ] = await Promise.all([
        pool.query('SELECT id, name, email as detail1, company as detail2 FROM crm_contacts WHERE name LIKE ? OR email LIKE ? LIMIT 5', [searchStr, searchStr]),
        pool.query('SELECT id, name, status as detail1, company as detail2 FROM crm_leads WHERE name LIKE ? OR company LIKE ? LIMIT 5', [searchStr, searchStr]),
        pool.query('SELECT id, name, role as detail1, email as detail2 FROM hrm_employees WHERE name LIKE ? OR email LIKE ? LIMIT 5', [searchStr, searchStr])
      ]);

      const results = [
        ...contacts.map(c => ({ id: c.id, type: 'Contact', name: c.name, detail1: c.detail1, detail2: c.detail2, route: 'crm-contacts' })),
        ...leads.map(l => ({ id: l.id, type: 'Deal', name: l.name, detail1: l.detail1, detail2: l.detail2, route: 'crm-pipeline' })),
        ...employees.map(e => ({ id: e.id, type: 'Employee', name: e.name, detail1: e.detail1, detail2: e.detail2, route: 'hrm-staff' }))
      ];

      return ok(res, results);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SearchController();
