// =============================================================================
// src/components/ui/Input.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';

const T = theme;

const baseStyle = (focused, error) => ({
  width:        '100%',
  padding:      '10px 13px',
  border:       `1.5px solid ${error ? T.status.danger : focused ? T.brand.indigo : T.border.light}`,
  borderRadius: T.radius.md,
  fontSize:     13,
  color:        T.text.primary,
  background:   '#fff',
  outline:      'none',
  boxSizing:    'border-box',
  fontFamily:   'inherit',
  transition:   'border-color 0.15s',
});

const labelStyle = {
  display:       'block',
  fontSize:      11,
  fontWeight:    700,
  color:         theme.text.muted,
  marginBottom:  5,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

// ─── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...baseStyle(focused, error), ...props.style }}
      />
      {error && <p style={{ color: T.status.danger, fontSize: 11, marginTop: 3 }}>{error}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseStyle(focused, error),
          appearance:          'none',
          cursor:              'pointer',
          backgroundImage:     `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat:    'no-repeat',
          backgroundPosition:  'right 12px center',
          paddingRight:        36,
          ...props.style,
        }}
      >
        {children}
      </select>
      {error && <p style={{ color: T.status.danger, fontSize: 11, marginTop: 3 }}>{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...baseStyle(focused, error), minHeight: 80, resize: 'vertical', ...props.style }}
      />
      {error && <p style={{ color: T.status.danger, fontSize: 11, marginTop: 3 }}>{error}</p>}
    </div>
  );
}
