// =============================================================================
// src/components/erp/ERPTopbar.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const T = theme;

function ERPTopbar({ activePage }) {
  const { erpUser } = useAuth();

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const pageLabels = {
    'erp-dashboard': 'Dashboard',
    'erp-inventory':  'Inventory Management',
    'erp-pos':        'Point of Sale',
    'erp-purchases':  'Purchase Orders',
    'erp-suppliers':  'Suppliers',
    'erp-employees':  'Employees',
    'erp-payroll':    'Payroll',
    'erp-reports':    'Sales Reports',
    'erp-settings':   'Settings',
  };

  return (
    <div style={{
      height: 58,
      background: T.surface.card,
      borderBottom: `1px solid ${T.border.light}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.01em' }}>
          {pageLabels[activePage] || 'ERP'}
        </div>
        <div style={{ fontSize: 11, color: T.text.subtle, marginTop: 1 }}>{dateStr}</div>
      </div>

      {/* ERP badge */}
      <div style={{ background: T.brand.indigoLight, border: `1px solid ${T.brand.indigoGlow}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: T.brand.indigo }}>
        🏪 ERP System
      </div>

      {/* CRM link */}
      <a href="/" style={{ textDecoration: 'none', background: T.border.light, borderRadius: T.radius.md, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: T.text.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
        ← CRM Portal
      </a>

      {/* User chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: T.radius.xl, padding: '5px 12px 5px 7px' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg, ${T.brand.pink}, ${T.brand.orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>
          {erpUser?.initials || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text.primary, lineHeight: 1.2 }}>{erpUser?.name}</div>
          <div style={{ fontSize: 10, color: T.text.muted }}>{erpUser?.role}</div>
        </div>
      </div>
    </div>
  );
}

export default ERPTopbar;
