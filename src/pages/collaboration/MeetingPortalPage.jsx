// src/pages/collaboration/MeetingPortalPage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function MeetingPortalPage() {
  return (
    <div>
      <PageHeader title="Meeting Portal" subtitle="Schedule and launch video conferences" />
      
      <div style={{ background: '#fff', padding: 40, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📹</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>No Active Meetings</h2>
        <p style={{ color: T.text.muted, maxWidth: 400, margin: '0 auto 24px', fontSize: 14 }}>
          Start a quick meeting or schedule one for later. Integration with Zoom/Google Meet coming soon.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={{ padding: '12px 24px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer' }}>
            Start Instant Meeting
          </button>
          <button style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer' }}>
            Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
