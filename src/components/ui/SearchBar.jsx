// =============================================================================
// src/components/ui/SearchBar.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';

const T = theme;

/**
 * Search input with magnifier icon.
 * Props: value, onChange(string), placeholder
 */
function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.text.muted, fontSize: 14, pointerEvents: 'none' }}>
        🔍
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding:      '8px 13px 8px 32px',
          border:       `1.5px solid ${T.border.light}`,
          borderRadius: T.radius.md,
          fontSize:     13,
          color:        T.text.primary,
          background:   '#fff',
          outline:      'none',
          width:        255,
          fontFamily:   'inherit',
        }}
      />
    </div>
  );
}

export default SearchBar;
