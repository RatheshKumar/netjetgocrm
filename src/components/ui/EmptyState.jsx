// =============================================================================
// src/components/ui/EmptyState.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';

const T = theme;

/**
 * Shown when a table or list has no data.
 * Props: icon (emoji), title, subtitle, action (optional button node)
 */
function EmptyState({ icon = '📋', title = 'No records yet', subtitle = '', action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: T.text.muted }}>
      <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.25 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text.subtle, marginBottom: 8 }}>{title}</div>
      {subtitle && <p style={{ fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 1.65, marginBottom: action ? 18 : 0 }}>{subtitle}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
