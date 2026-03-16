// =============================================================================
// src/components/ui/DataTable.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import EmptyState from './EmptyState';
import Button from './Button';

const T = theme;

/**
 * Paginated data table.
 *
 * Props:
 *   columns       → array of column header strings
 *   data          → array of row objects
 *   renderRow     → function(item, index) → <TR> element
 *   emptyIcon     → emoji for empty state
 *   emptyTitle    → empty state heading
 *   emptySubtitle → empty state description
 *   onAdd         → function called by empty state "Add" button
 *   addLabel      → label for the empty state button
 */
function DataTable({ columns, data, renderRow, emptyIcon, emptyTitle, emptySubtitle, onAdd, addLabel }) {
  const [page, setPage] = useState(1);
  const PER_PAGE    = 10;
  const totalPages  = Math.max(1, Math.ceil(data.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageData    = data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  if (data.length === 0) {
    return (
      <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg }}>
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          subtitle={emptySubtitle}
          action={onAdd && <Button onClick={onAdd}>+ {addLabel || 'Add Record'}</Button>}
        />
      </div>
    );
  }

  return (
    <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#FAFBFF', borderBottom: `1px solid ${T.border.light}` }}>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => renderRow(row, i))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderTop: `1px solid ${T.border.light}`, background: '#FAFBFF' }}>
          <span style={{ fontSize: 12, color: T.text.muted }}>
            {data.length} records · Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              ['«', () => setPage(1)],
              ['‹', () => setPage(p => Math.max(1, p - 1))],
              ['›', () => setPage(p => Math.min(totalPages, p + 1))],
              ['»', () => setPage(totalPages)],
            ].map(([label, action], i) => (
              <button key={i} onClick={action} style={{ background: '#fff', border: `1px solid ${T.border.light}`, borderRadius: T.radius.sm, padding: '4px 10px', cursor: 'pointer', color: T.text.muted, fontSize: 13 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Table Row & Cell helpers ─────────────────────────────────────────────────
export function TR({ children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: `1px solid ${T.border.light}`, background: hovered ? T.surface.cardHover : T.surface.card, transition: 'background 0.1s' }}
    >
      {children}
    </tr>
  );
}

export function TD({ children, style }) {
  return (
    <td style={{ padding: '12px 14px', color: theme.text.primary, verticalAlign: 'middle', fontSize: 13, ...style }}>
      {children}
    </td>
  );
}

export default DataTable;
