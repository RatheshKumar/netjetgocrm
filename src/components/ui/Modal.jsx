// =============================================================================
// src/components/ui/Modal.jsx
// =============================================================================
import React from 'react';
import theme from '../../config/theme';
import Button from './Button';

const T = theme;

/**
 * Slide-in modal dialog.
 * Props:
 *   title     → modal title
 *   onClose   → called when user clicks Cancel or backdrop
 *   onSave    → called when user clicks Save button
 *   saveLabel → custom save button label (default: "Save")
 *   wide      → true for wider modal (660px vs 460px)
 *   children  → form fields inside
 */
function Modal({ title, onClose, onSave, saveLabel = 'Save', wide = false, children }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position:   'fixed',
        inset:       0,
        background: 'rgba(26,28,46,0.45)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:     1000,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{
        background:   T.surface.card,
        border:       `1px solid ${T.border.light}`,
        borderRadius: T.radius.xl,
        padding:      28,
        width:        wide ? 660 : 460,
        maxHeight:    '88vh',
        overflowY:    'auto',
        boxShadow:    '0 24px 60px rgba(0,0,0,0.16)',
        animation:    'modalIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border.light}` }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text.primary }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: T.text.muted, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {/* Form content */}
        {children}

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, paddingTop: 16, borderTop: `1px solid ${T.border.light}` }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>{saveLabel}</Button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
