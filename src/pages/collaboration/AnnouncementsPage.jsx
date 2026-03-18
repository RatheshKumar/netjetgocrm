// src/pages/collaboration/AnnouncementsPage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function AnnouncementsPage() {
  const news = [
    { date: 'Oct 24', title: 'Q4 Strategy Meeting', desc: 'All managers please attend the meeting room at 2 PM.' },
    { date: 'Oct 23', title: 'System Maintenance', desc: 'The OS will be undergoing minor updates tonight at 11 PM.' }
  ];

  return (
    <div>
      <PageHeader title="Company Announcements" subtitle="Latest news and updates for the team" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {news.map(n => (
          <div key={n.title} style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
            <div style={{ color: T.brand.pink, fontWeight: 800, fontSize: 11, marginBottom: 4 }}>{n.date}</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{n.title}</h3>
            <p style={{ color: T.text.muted, fontSize: 14 }}>{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
