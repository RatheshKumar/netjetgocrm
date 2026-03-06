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

  { id: 'products',   label: 'Products',         icon: '📦' },
  { id: 'projects',   label: 'Projects',         icon: '🏗️' },
  { id: 'tickets',    label: 'Tickets',          icon: '🎫' },
  { id: 'reports',    label: 'Reports',          icon: '📊' },
];

export default navigation;
