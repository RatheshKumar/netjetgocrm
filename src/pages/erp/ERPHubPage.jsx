// src/pages/erp/ERPHubPage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function ERPHubPage({ setPage }) {
  const modules = [
    { id: 'erp-inventory', label: 'Inventory', icon: '📦', desc: 'Track stock and warehouse levels' },
    { id: 'erp-pos',       label: 'Point of Sale', icon: '🛒', desc: 'Manage retail transactions' },
    { id: 'erp-purchases', label: 'Purchasing', icon: '🛍️', desc: 'Procure goods and services' },
    { id: 'erp-suppliers', label: 'Suppliers', icon: '🤝', desc: 'Manage vendor relationships' },
    { id: 'erp-payroll',   label: 'Payroll', icon: '💵', desc: 'Employee salary and tax' },
    { id: 'erp-finance',   label: 'Finance / Accounting', icon: '🏦', desc: 'General ledger and reporting' },
    { id: 'erp-production',label: 'Manufacturing', icon: '🏭', desc: 'Production floor management' },
    { id: 'erp-scm',       label: 'Supply Chain', icon: '🚛', desc: 'Logistics and delivery' }
  ];

  return (
    <div>
      <PageHeader title="ERP Management Hub" subtitle="Central gateway to all enterprise resource tools" />
      
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, paddingBottom: 40 }}>
      {modules.map(m => (
        <div 
          key={m.id} 
          onClick={() => setPage(m.id)}
          style={{ 
            background: '#fff', padding: '40px 32px', borderRadius: T.radius.xl, 
            border: `1px solid ${T.border.light}`, cursor: 'pointer', transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)', 
            boxShadow: T.shadow.md, display: 'flex', flexDirection: 'column', alignItems: 'center', 
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = T.brand.indigo;
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = T.shadow.premium;
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = T.border.light;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = T.shadow.md;
          }}
        >
          {/* Subtle Background Glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 100, height: 100, background: T.brand.indigoGlow, borderRadius: '50%', filter: 'blur(40px)' }} />
          
          <div style={{ fontSize: 48, marginBottom: 24, padding: 20, background: T.surface.page, borderRadius: T.radius.lg }}>{m.icon}</div>
          <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12, color: T.text.primary, letterSpacing: '-0.02em' }}>{m.label}</h3>
          <p style={{ color: T.text.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 240 }}>{m.desc}</p>
          
          <div style={{ padding: '8px 24px', background: T.brand.indigo, color: '#fff', borderRadius: T.radius.md, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Open Module →
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}
