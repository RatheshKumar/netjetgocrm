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
      height: 70,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${T.border.light}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      gap: 20,
      flexShrink: 0,
      fontFamily: T.fonts.body,
      position: 'sticky',
      top: 0,
      zIndex: 90,
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text.primary, letterSpacing: '-0.03em' }}>
          {pageLabels[activePage] || 'ERP'}
        </div>
        <div style={{ fontSize: 11, color: T.text.muted, marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dateStr}</div>
      </div>

      {/* Search mock */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 14, fontSize: 14, opacity: 0.5 }}>🔍</span>
        <input 
          type="text" 
          placeholder="Search inventory, sales or customers..." 
          style={{ width: '100%', padding: '10px 10px 10px 40px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: 12, fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* CRM link */}
      <a href="/" style={{ 
        textDecoration: 'none', 
        background: 'rgba(99, 102, 241, 0.1)', 
        borderRadius: 12, 
        padding: '8px 16px', 
        fontSize: 12, 
        fontWeight: 700, 
        color: T.brand.indigo, 
        display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s',
        border: '1px solid rgba(99, 102, 241, 0.1)'
      }}>
        <span>←</span> CRM Portal
      </a>

      {/* User chip */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 10, 
        background: '#fff', 
        border: `1px solid ${T.border.light}`, 
        borderRadius: 16, 
        padding: '6px 14px 6px 8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ 
          width: 32, height: 32, borderRadius: 10, 
          background: `linear-gradient(135deg, ${T.brand.pink}, ${T.brand.orange})`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: 12, fontWeight: 800, color: '#fff' 
        }}>
          {erpUser?.initials || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, lineHeight: 1 }}>{erpUser?.name?.split(' ')[0]}</div>
          <div style={{ fontSize: 10, color: T.text.muted, fontWeight: 600 }}>{erpUser?.role}</div>
        </div>
      </div>
    </div>
  );
}

export default ERPTopbar;
