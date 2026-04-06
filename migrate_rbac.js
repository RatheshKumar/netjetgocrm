const pool = require('./backend/config/db');

async function migrate() {
  console.log('--- NetJetGo CRM/HRM RBAC Migration: Identity & Ownership ---');
  try {
    // 1. CRM Contacts Ownership
    await pool.query(`ALTER TABLE crm_contacts ADD COLUMN assignedTo VARCHAR(255) DEFAULT ''`);
    console.log('✓ Added assignedTo to crm_contacts');
  } catch (e) { console.log('! crm_contacts.assignedTo might already exist'); }

  try {
    // 2. CRM Companies Ownership
    await pool.query(`ALTER TABLE crm_companies ADD COLUMN assignedTo VARCHAR(255) DEFAULT ''`);
    console.log('✓ Added assignedTo to crm_companies');
  } catch (e) { console.log('! crm_companies.assignedTo might already exist'); }

  try {
    // 3. CRM Invoices Ownership (Extended CRUD)
    await pool.query(`ALTER TABLE crm_invoices ADD COLUMN assignedTo VARCHAR(255) DEFAULT ''`);
    console.log('✓ Added assignedTo to crm_invoices');
  } catch (e) { console.log('! crm_invoices.assignedTo might already exist'); }

  try {
    // 4. HRM Personnel Privacy
    // (Already has employeeName/name; ensuring it is searchable)
    await pool.query(`CREATE INDEX idx_cnt_assigned ON crm_contacts(assignedTo)`);
    await pool.query(`CREATE INDEX idx_cmp_assigned ON crm_companies(assignedTo)`);
    console.log('✓ Created indexes for optimized siloing');
  } catch (e) { console.log('! Indexes already exist'); }

  console.log('--- Migration Complete ---');
  process.exit(0);
}

migrate();
