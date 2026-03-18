// src/pages/collaboration/KnowledgeBasePage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function KnowledgeBasePage() {
  const articles = [
    { title: 'ERP Inventory Basics', cat: 'ERP' },
    { title: 'CRM Lead Management', cat: 'CRM' },
    { title: 'HRM Attendance Policy', cat: 'HR' },
    { title: 'Collaboration Tools Guide', cat: 'General' }
  ];

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Internal documentation and training resources" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {articles.map(a => (
          <div key={a.title} style={{ background: '#fff', padding: 20, borderRadius: T.radius.md, border: `1px solid ${T.border.light}` }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: T.brand.indigo, textTransform: 'uppercase' }}>{a.cat}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '8px 0' }}>{a.title}</h3>
            <button style={{ color: T.brand.indigo, border: 'none', background: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Read Article →</button>
          </div>
        ))}
      </div>
    </div>
  );
}
