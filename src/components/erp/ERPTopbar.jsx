// =============================================================================
// src/components/erp/ERPTopbar.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const T = theme;

function ERPTopbar() {
  const { user } = useAuth();
  const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const [showQuick, setShowQuick] = useState(false);

  return (
    <div style={{
      height:        64,
      background:    '#fff',
      borderBottom:  `1px solid ${T.border.light}`,
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       '0 32px',
      flexShrink:    0,
      fontFamily: T.fonts.body,
      position:      'relative',
      zIndex:        100,
    }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        {/* Date */}
        <span style={{ fontSize: 12, color: T.text.muted }}>{dateStr}</span>

        <div style={{ position: 'relative', display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setShowQuick(!showQuick)}
            style={{ 
              padding: '10px 18px', background: '#fff', color: T.text.primary, 
              border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, 
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: '0.2s',
            }}
          >
            ⚡ Quick Actions
          </button>
          
          {showQuick && (
            <div style={{ position: 'absolute', top: 48, left: 0, width: 220, background: '#fff', boxShadow: T.shadow.premium, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: 12, zIndex: 1000 }}>
               <div style={{ fontSize: 10, fontWeight: 800, color: T.text.muted, textTransform: 'uppercase', marginBottom: 12, padding: '0 8px' }}>Global Actions</div>
               {['🎯 Create Lead', '👤 Add Contact', '🎫 New Ticket'].map(a => (
                 <div key={a} style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: T.radius.md, color: T.text.primary }} onMouseOver={e => e.currentTarget.style.background = T.surface.page} onMouseOut={e => e.currentTarget.style.background = 'none'}>{a}</div>
               ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* OS Status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.brand.indigoLight, border: `1px solid ${T.brand.indigoGlow}`, borderRadius: 20, padding: '4px 12px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.status.success, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: T.brand.indigo, fontWeight: 700 }}>Unified OS Active</span>
        </div>

        {/* Welcome */}
        <span style={{ fontSize: 12, color: T.text.muted }}>
          Welcome back, <strong style={{ color: T.text.primary }}>{user?.name}</strong>
        </span>
      </div>
    </div>
  );
}

export default ERPTopbar;
