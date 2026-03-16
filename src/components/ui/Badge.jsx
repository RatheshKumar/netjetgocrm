// =============================================================================
// src/components/ui/Badge.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';

/**
 * Colored status badge.
 * Automatically picks color from theme.badges map.
 * Usage: <Badge>Won</Badge>  or  <Badge>High</Badge>
 */
function Badge({ children }) {
  const colors = theme.badges[children] || { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' };
  return (
    <span style={{
      background:   colors.bg,
      color:        colors.text,
      padding:      '3px 10px',
      borderRadius: 20,
      fontSize:     11,
      fontWeight:   700,
      whiteSpace:   'nowrap',
      display:      'inline-block',
    }}>
      {children}
    </span>
  );
}

export default Badge;
