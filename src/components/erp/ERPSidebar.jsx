// =============================================================================
// src/components/erp/ERPSidebar.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import erpNavigation from '../../config/erp-navigation';
import { useAuth } from '../../context/AuthContext';

const T = theme;

const SECTIONS = {
  main:       'Main',
  procurement:'Procurement',
  hr:         'Human Resources',
  analytics:  'Analytics',
  system:     'System',
};

function ERPSidebar({ activePage, setPage, counts = {} }) {
  const { erpUser, erpLogout } = useAuth();
  const [logoutHovered, setLogoutHovered] = useState(false);

  // Group nav by section
  const grouped = erpNavigation.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div style={{
      width: 260, // Slightly wider for better breathing room
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
      color: '#cbd5e1',
      fontFamily: T.fonts.body,
      zIndex: 100,
    }}>

      {/* ── Logo Section ────────────────────────────────────────────────── */}
      <div style={{ padding: '32px 24px 24px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ 
            width: 40, height: 40, 
            background: `linear-gradient(135deg, ${T.brand.indigo}, ${T.brand.pink})`, 
            borderRadius: 12, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 20, 
            boxShadow: `0 4px 12px ${T.brand.indigo}44`,
            flexShrink: 0 
          }}>🏪</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>NetJetGo</div>
            <div style={{ fontSize: 10, color: T.brand.indigoLight, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>ERP PRO</div>
          </div>
        </div>
        
        {erpUser?.shopName && (
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            backdropFilter: 'blur(10px)',
            borderRadius: 10, 
            padding: '8px 12px', 
            fontSize: 11, 
            color: '#94a3b8', 
            fontWeight: 600, 
            marginTop: 20, 
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ opacity: 0.8 }}>🏪</span> {erpUser.shopName}
          </div>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} style={{ marginBottom: 24 }}>
            <p style={{ 
              color: '#64748b', 
              fontSize: 10, 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.12em', 
              paddingLeft: 12, 
              marginBottom: 10 
            }}>
              {SECTIONS[section] || section}
            </p>
            {items.map(item => {
              const isActive = activePage === item.id;
              const count    = counts[item.id];
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '10px 14px', border: 'none',
                    cursor: 'pointer', borderRadius: 12, marginBottom: 4, textAlign: 'left',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: isActive ? '#fff' : '#94a3b8',
                    fontWeight: isActive ? 700 : 500, fontSize: 13,
                    fontFamily: 'inherit', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {isActive && (
                    <div style={{ 
                      position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 4, 
                      background: T.brand.indigo, borderRadius: '0 4px 4px 0',
                      boxShadow: `0 0 10px ${T.brand.indigo}`
                    }} />
                  )}
                  <span style={{ fontSize: 16, filter: isActive ? 'none' : 'grayscale(1) opacity(0.7)' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {count > 0 && (
                    <span style={{ 
                      background: isActive ? T.brand.indigo : 'rgba(255,255,255,0.1)', 
                      color: '#fff', borderRadius: 6, padding: '2px 6px', 
                      fontSize: 10, fontWeight: 700,
                      boxShadow: isActive ? `0 2px 8px ${T.brand.indigo}66` : 'none'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Footer / User Profile ────────────────────────────────────────── */}
      <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ 
            width: 44, height: 44, borderRadius: 14, 
            background: `linear-gradient(135deg, ${T.brand.pink}, ${T.brand.orange})`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 14, fontWeight: 800, color: '#fff', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            flexShrink: 0 
          }}>
            {erpUser?.initials || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{erpUser?.name}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{erpUser?.role}</div>
          </div>
        </div>

        <button
          onClick={erpLogout}
          style={{ 
            width: '100%', padding: '10px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: 12, 
            background: 'rgba(255,255,255,0.03)', 
            color: '#fff', 
            cursor: 'pointer', fontSize: 12, fontWeight: 700, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, 
            fontFamily: 'inherit', transition: 'all 0.2s' 
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </div>
  );
}

export default ERPSidebar;
