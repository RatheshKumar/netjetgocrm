// =============================================================================
// src/components/ui/PageHeader.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';

const T = theme;

/**
 * Standard page title + action buttons row.
 * Props: title, count (optional badge number), children (buttons/tools on right)
 */
function PageHeader({ title, subtitle, count, right, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            {title}
            {count !== undefined && (
              <span style={{ fontSize: 13, color: T.brand.indigo, fontWeight: 700, background: T.brand.indigoLight, padding: '2px 10px', borderRadius: 20 }}>
                {count}
              </span>
            )}
          </h1>
          {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: T.text.muted, fontWeight: 500 }}>{subtitle}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {right}
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
