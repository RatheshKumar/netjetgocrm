// src/pages/collaboration/DiscussionRoomPage.jsx
import React from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function DiscussionRoomPage() {
  return (
    <div>
      <PageHeader title="Discussion Rooms" subtitle="Topic-based forums for long-term planning" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {['Q4 Strategy', 'Product Roadmap', 'Company Culture', 'Tech Stack Audit'].map(room => (
          <div key={room} style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, cursor: 'pointer', transition: '0.2s' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>#{room.replace(/\s/g, '-').toLowerCase()}</h3>
            <div style={{ fontSize: 12, color: T.text.muted, marginBottom: 16 }}>12 active participants • 4 new posts</div>
            <div style={{ display: 'flex', gap: -8 }}>
               {[1,2,3].map(i => <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: T.border.medium, border: '2px solid #fff', marginLeft: i > 1 ? -8 : 0 }} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
