// =============================================================================
// src/config/db.js
// =============================================================================
// 🗄 DATABASE CONFIGURATION
//
// This file defines all the storage key prefixes used in the app.
// The database uses window.storage (persistent key-value storage).
//
// STORAGE FORMAT:
//   Each record is stored as:   "prefix:uniqueID" → JSON string
//   e.g.  "contacts:1234-abcde" → '{"name":"John","email":"..."}'
//
// HOW TO ADD A NEW DATA TYPE:
//   1. Add a new key prefix below (e.g. PRODUCTS: 'products:')
//   2. Use storage.save(DB_KEYS.PRODUCTS, data) in your page
// =============================================================================

export const DB_KEYS = {
  // Auth
  SESSION:    'session:current',    // Stores the logged-in user's email
  USERS:      'users:',             // Prefix for all user accounts

  // CRM Data
  CONTACTS:   'contacts:',
  COMPANIES:  'companies:',
  LEADS:      'leads:',
  CONTRACTS:  'contracts:',
  INVOICES:   'invoices:',
  PAYMENTS:   'payments:',
  TASKS:      'tasks:',
  PIPELINES:  'pipelines:',

  // ── NEW DATA TYPES ────────────────────────────────────────────────────────
  PRODUCTS:  'products:',
  PROJECTS:  'projects:',
  TICKETS:   'tickets:',
  // ───────────────────────────────────────────────────────────────────────

  // ── ERP Data ─────────────────────────────────────────────────────────────
  ERP_SESSION:   'erp_session:current',
  ERP_USERS:     'erp_users:',
  ERP_INVENTORY: 'erp_inventory:',
  ERP_PURCHASES: 'erp_purchases:',
  ERP_SUPPLIERS: 'erp_suppliers:',
  ERP_EMPLOYEES: 'erp_employees:',
  ERP_PAYROLL:   'erp_payroll:',
  ERP_POS_SALES: 'erp_pos_sales:',
  // ─────────────────────────────────────────────────────────────────────────
};

// =============================================================================
// DROPDOWN OPTIONS — Edit these arrays to change dropdown choices in forms.
// =============================================================================

export const OPTIONS = {
  // Lead statuses
  leadStatuses: ['Won', 'Lost', 'Pending', 'In Progress', 'Closed'],

  // Lead sources
  leadSources: ['Website', 'Referral', 'Cold Call', 'Email', 'Social Media', 'Event', 'Other'],

  // Company industries
  industries: [
    'Technology', 'Marketing', 'Finance', 'Healthcare',
    'Education', 'Retail', 'Manufacturing', 'Consulting', 'Media', 'Other',
  ],

  // Company sizes
  companySizes: ['1–10', '11–50', '51–200', '201–500', '500+'],

  // Contract types
  contractTypes: [
    'Service Agreement', 'Contract Under Seal', 'Implied Contract',
    'Executory Contract', 'NDA', 'SLA', 'Retainer',
  ],

  // Contract statuses
  contractStatuses: ['Active', 'Draft', 'Under Review', 'Expired'],

  // Invoice statuses
  invoiceStatuses: ['Draft', 'Unpaid', 'Partial', 'Paid', 'Overdue'],

  // Payment methods
  paymentMethods: ['Cash', 'Credit Card', 'Bank Transfer', 'Check', 'Online Payment'],

  // Task statuses
  taskStatuses: ['Todo', 'In Progress', 'Completed', 'Blocked'],

  // Task priorities
  taskPriorities: ['High', 'Medium', 'Low'],

  // Pipeline stages
  pipelineStages: [
    'Prospecting', 'Qualification', 'Proposal',
    'Negotiation', 'Closed Won', 'Closed Lost',
  ],

  // Pipeline statuses
  pipelineStatuses: ['Active', 'Paused', 'Completed', 'Cancelled'],

  // User roles (shown at signup)
  userRoles: [
    'Admin', 'CEO / Founder', 'HR Manager', 'Sales Representative', 
    'Marketing Specialist', 'Accountant', 'Support Agent', 'Project Manager', 
    'Regular Employee'
  ],

  // Project statuses
  projectStatuses: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],

  // Ticket statuses
  ticketStatuses: ['Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed'],

  // Ticket priorities
  ticketPriorities: ['Low', 'Normal', 'High', 'Urgent'],

  // Product categories
  productCategories: ['Software', 'Hardware', 'Service', 'Subscription', 'Other'],

  // ── ERP Options ───────────────────────────────────────────────────────────
  erpRoles: ['Shop Owner', 'Manager', 'Cashier', 'Stock Clerk', 'Accountant', 'Other'],
  erpInventoryCategories: ['Electronics', 'Clothing', 'Food & Beverage', 'Health & Beauty', 'Home & Garden', 'Toys & Games', 'Sports', 'Books & Stationery', 'Automotive', 'Other'],
  erpPurchaseStatuses: ['Draft', 'Ordered', 'Received', 'Partial', 'Cancelled'],
  erpSupplierStatuses: ['Active', 'Inactive', 'Blacklisted'],
  erpEmployeeStatuses: ['Active', 'On Leave', 'Terminated'],
  erpEmployeeDepts: ['Sales', 'Warehouse', 'Finance', 'HR', 'IT', 'Management', 'Delivery'],
  erpPayrollStatuses: ['Pending', 'Paid', 'On Hold'],
  erpPaymentMethods: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Bank Transfer'],
};
