// =============================================================================
// src/config/navigation.js
// =============================================================================
// 🗂 SIDEBAR NAVIGATION — Add, remove, or reorder menu items here.
//
// Each item needs:
//   id     → matches the page key in App.jsx
//   label  → text shown in the sidebar
//   icon   → emoji icon shown next to the label
// =============================================================================

const navigation = [
  { id: 'dashboard',  label: 'Dashboard',       icon: '⊞' },
  { id: 'contacts',   label: 'Contacts',         icon: '👤' },
  { id: 'companies',  label: 'Companies',        icon: '🏢' },
  { id: 'leads',      label: 'Leads',            icon: '📈' },
  { id: 'pipeline',   label: 'Pipeline',         icon: '🔀' },
  { id: 'contracts',  label: 'Contracts',        icon: '📄' },
  { id: 'invoices',   label: 'Invoices',         icon: '🧾' },
  { id: 'payments',   label: 'Payments',         icon: '💳' },
  { id: 'tasks',      label: 'Tasks',            icon: '✅' },

  // ── HOW TO ADD A NEW PAGE ───────────────────────────────────────────────
  // 1. Add a new entry below (uncomment and edit):
  //    { id: 'reports', label: 'Reports', icon: '📊' },
  //
  // 2. Create the page file: src/pages/ReportsPage.jsx
  //    (copy ContactsPage.jsx as a starting template)
  //
  // 3. In src/App.jsx, add it to the `pages` object:
  //    reports: <ReportsPage ... />
  // ───────────────────────────────────────────────────────────────────────
];

export default navigation;
