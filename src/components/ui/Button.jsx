// =============================================================================
// src/components/ui/Button.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';

const T = theme;

/**
 * Button component.
 *
 * Props:
 *   variant  → 'primary' | 'secondary' | 'danger' | 'ghost'  (default: primary)
 *   size     → 'sm' | 'md' | 'lg'                            (default: md)
 *   full     → true to stretch full width
 *   disabled → disables the button
 *   onClick  → click handler
 */
function Button({ children, variant = 'primary', size = 'md', onClick, disabled, full, style }) {
  const [hovered, setHovered] = useState(false);

  const variants = {
    primary:   { bg: T.brand.indigo,   hbg: T.brand.indigoMid, color: '#fff',      border: 'none' },
    secondary: { bg: '#fff',            hbg: T.surface.cardHover, color: T.text.primary, border: `1.5px solid ${T.border.light}` },
    danger:    { bg: '#fff',            hbg: 'rgba(239,68,68,0.05)', color: T.status.danger, border: `1.5px solid rgba(239,68,68,0.25)` },
    ghost:     { bg: 'transparent',    hbg: T.brand.indigoLight, color: T.brand.indigo, border: 'none' },
  };

  const sizes = {
    sm: { padding: '5px 11px', fontSize: 12 },
    md: { padding: '9px 18px', fontSize: 13 },
    lg: { padding: '12px 24px', fontSize: 14 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding:     s.padding,
        fontSize:    s.fontSize,
        fontWeight:  600,
        fontFamily:  'inherit',
        background:  hovered ? v.hbg : v.bg,
        color:       v.color,
        border:      v.border,
        borderRadius: T.radius.md,
        cursor:      disabled ? 'not-allowed' : 'pointer',
        opacity:     disabled ? 0.5 : 1,
        whiteSpace:  'nowrap',
        transition:  'all 0.15s',
        width:       full ? '100%' : 'auto',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Button;
