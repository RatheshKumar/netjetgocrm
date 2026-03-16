// =============================================================================
// src/components/ui/StatCard.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';

const T = theme;

/**
 * KPI stat card for the dashboard.
 * Props: label, value, icon (emoji), color (hex), sub (small subtitle text)
 */
function StatCard({ label, value, icon, color = T.brand.indigo, sub }) {
  return (
    <div style={{
      background:   T.surface.card,
      border:       `1px solid ${T.border.light}`,
      borderRadius: T.radius.lg,
      padding:      '18px 20px',
      boxShadow:    '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Top row: label + icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <div style={{ width: 34, height: 34, borderRadius: T.radius.md, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
          {icon}
        </div>
      </div>

      {/* Main value */}
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em' }}>
        {value}
      </div>

      {/* Subtitle */}
      {sub && <div style={{ fontSize: 11, color: T.text.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default StatCard;
