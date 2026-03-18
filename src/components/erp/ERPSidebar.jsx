// =============================================================================
// src/components/erp/ERPSidebar.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import erpNavigation from '../../config/erp-navigation';
import { useAuth } from '../../context/AuthContext';
import logoDark from '../../assets/logo-dark.png';

const T = theme;

const SECTIONS = {
  main:       'Main Menu',
  procurement:'Procurement',
  hr:         'Human Resources',
  analytics:  'Analytics',
  system:     'System Settings',
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
      width:         215,
      background:    T.surface.sidebar,
      display:       'flex',
      flexDirection: 'column',
      flexShrink:    0,
      height:        '100vh',
      position:      'sticky',
      top:            0,
      boxShadow:     '2px 0 16px rgba(0,0,0,0.10)',
    }}>

      {/* ── Logo ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
        <img
          src={logoDark}
          alt="NetJetGo"
          style={{ width: '100%', maxWidth: 155, height: 'auto', display: 'block' }}
        />
        <p style={{ color: T.text.onBrandMuted, fontSize: 9, marginTop: 4, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
          ERP Platform
        </p>
        {erpUser?.shopName && (
          <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: T.radius.sm, padding: '4px 8px', fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🏪 {erpUser.shopName}
          </div>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} style={{ marginBottom: 12 }}>
            <p style={{ color: T.text.onBrandMuted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', padding: '4px 10px', marginBottom: 4 }}>
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
                    display:     'flex',
                    alignItems:  'center',
                    gap:          9,
                    width:        '100%',
                    padding:      '8px 10px',
                    border:       'none',
                    borderLeft:   isActive ? '3px solid rgba(255,255,255,0.8)' : '3px solid transparent',
                    cursor:       'pointer',
                    borderRadius: T.radius.md,
                    marginBottom: 2,
                    textAlign:    'left',
                    background:   isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color:        isActive ? '#fff' : T.text.onBrandMuted,
                    fontWeight:   isActive ? 700 : 500,
                    fontSize:     12,
                    fontFamily:   'inherit',
                    transition:   'all 0.13s',
                  }}
                >
                  <span style={{ fontSize: 14, width: 17, textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {count > 0 && (
                    <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User Profile + Logout ────────────────────────────────────────── */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.brand.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: T.brand.indigo, flexShrink: 0 }}>
            {erpUser?.initials || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{erpUser?.name}</div>
            <div style={{ fontSize: 10, color: T.text.onBrandMuted }}>{erpUser?.role}</div>
          </div>
        </div>

        <button
          onClick={erpLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{ width: '100%', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.20)', borderRadius: T.radius.md, background: logoutHovered ? 'rgba(255,255,255,0.10)' : 'transparent', color: T.text.onBrandMuted, cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit', transition: 'background 0.15s' }}
        >
          🚪 Sign Out
        </button>
      </div>
    </div>
  );
}

export default ERPSidebar;
