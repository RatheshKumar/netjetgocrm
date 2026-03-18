// src/pages/erp/FinancialsPage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function FinancialsPage() {
  return (
    <div>
      <PageHeader title="Financial Management" subtitle="General Ledger, Accounts Payable, and Accounts Receivable" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ marginBottom: 16 }}>Balance Summary</h3>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.status.success }}>$1,240,500.00</div>
          <p style={{ color: T.text.muted, fontSize: 12 }}>Total Liquidity</p>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3>Recent Transactions</h3>
          <p style={{ color: T.text.muted, marginTop: 10 }}>Transaction history placeholder...</p>
        </div>
      </div>
    </div>
  );
}
