// =============================================================================
// src/components/layout/Topbar.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const T = theme;

/**
 * Top navigation bar — shows date, db status, and welcome message.
 */
function Topbar() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{
      height:        52,
      background:    '#fff',
      borderBottom:  `1px solid ${T.border.light}`,
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       '0 26px',
      flexShrink:    0,
      boxShadow:     '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Date */}
      <span style={{ fontSize: 12, color: T.text.muted }}>{today}</span>

      {/* Right side indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* DB status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.brand.indigoLight, border: `1px solid ${T.brand.indigoGlow}`, borderRadius: 20, padding: '4px 12px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.status.success, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: T.brand.indigo, fontWeight: 700 }}>Database Connected</span>
        </div>

        {/* Welcome */}
        <span style={{ fontSize: 12, color: T.text.muted }}>
          Welcome back, <strong style={{ color: T.text.primary }}>{user?.name}</strong>
        </span>
      </div>
    </div>
  );
}

export default Topbar;
