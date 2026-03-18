// =============================================================================
// src/config/erp-navigation.js
// =============================================================================
// 🗂 ERP SIDEBAR NAVIGATION — Retail ERP system menu items.
// =============================================================================

const erpNavigation = [
  { id: 'erp-dashboard',  label: 'Dashboard',   icon: '⊞',  section: 'main' },
  { id: 'erp-inventory',  label: 'Inventory',   icon: '📦', section: 'main' },
  { id: 'erp-pos',        label: 'Point of Sale',icon: '🧾', section: 'main' },

  { id: 'erp-purchases',  label: 'Purchases',   icon: '🛒', section: 'procurement' },
  { id: 'erp-suppliers',  label: 'Suppliers',   icon: '🤝', section: 'procurement' },

  { id: 'erp-employees',  label: 'Employees',   icon: '👥', section: 'hr' },
  { id: 'erp-payroll',    label: 'Payroll',     icon: '💰', section: 'hr' },

  { id: 'erp-reports',    label: 'Reports',     icon: '📊', section: 'analytics' },
  { id: 'erp-settings',   label: 'Settings',    icon: '⚙️', section: 'system' },
  { id: 'erp-tickets',    label: 'Support Tickets', icon: '🎫', section: 'system' },
];

export default erpNavigation;
