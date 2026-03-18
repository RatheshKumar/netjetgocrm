// =============================================================================
// src/erp/ERPShell.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../config/theme';
import ERPSidebar from '../components/erp/ERPSidebar';
import ERPTopbar  from '../components/erp/ERPTopbar';
import { DB_KEYS } from '../config/db';
import useDB from '../hooks/useDB';

// Import all ERP pages
import ERPDashboardPage from '../pages/erp/ERPDashboardPage';
import InventoryPage    from '../pages/erp/InventoryPage';
import POSPage          from '../pages/erp/POSPage';
import PurchasesPage    from '../pages/erp/PurchasesPage';
import SuppliersPage    from '../pages/erp/SuppliersPage';
import EmployeesPage    from '../pages/erp/EmployeesPage';
import PayrollPage      from '../pages/erp/PayrollPage';
import ERPReportsPage   from '../pages/erp/ERPReportsPage';
import ERPSettingsPage  from '../pages/erp/ERPSettingsPage';
import ERPTicketsPage  from '../pages/erp/ERPTicketsPage';

const T = theme;

function ERPShell() {
  const [activePage, setActivePage] = useState('erp-dashboard');

  // Data for badge counts
  const inventory = useDB(DB_KEYS.ERP_INVENTORY);
  const employees = useDB(DB_KEYS.ERP_EMPLOYEES);
  const purchases = useDB(DB_KEYS.ERP_PURCHASES);
  const payroll   = useDB(DB_KEYS.ERP_PAYROLL);

  const counts = {
    'erp-inventory': inventory.items.filter(i => (i.stock || 0) <= (i.lowStockThreshold || 5)).length || 0,
    'erp-purchases': purchases.items.filter(p => p.status === 'Ordered').length || 0,
    'erp-payroll':   payroll.items.filter(p => p.status === 'Pending').length || 0,
    'erp-employees': employees.items.filter(e => e.status === 'Active').length || 0,
  };

  const pages = {
    'erp-dashboard': <ERPDashboardPage />,
    'erp-inventory':  <InventoryPage />,
    'erp-pos':        <POSPage />,
    'erp-purchases':  <PurchasesPage />,
    'erp-suppliers':  <SuppliersPage />,
    'erp-employees':  <EmployeesPage />,
    'erp-payroll':    <PayrollPage />,
    'erp-reports':    <ERPReportsPage />,
    'erp-settings':   <ERPSettingsPage />,
    'erp-tickets':    <ERPTicketsPage />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <ERPSidebar
        activePage={activePage}
        setPage={setActivePage}
        counts={counts}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ERPTopbar activePage={activePage} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: T.surface.page }}>
          {pages[activePage] || <div style={{ color: T.text.muted, padding: 40 }}>Page not found.</div>}
        </main>
      </div>
    </div>
  );
}

export default ERPShell;
