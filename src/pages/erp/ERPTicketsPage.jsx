// =============================================================================
// src/pages/erp/ERPTicketsPage.jsx
// =============================================================================
import React, { useState, useMemo } from 'react';
import theme from '../../config/theme';
import { DB_KEYS, OPTIONS } from '../../config/db';
import useDB from '../../hooks/useDB';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };

function Modal({ title, onClose, onSave, form, setForm, saving }) {
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 500, animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={labelStyle}>Subject *</label>
              <input value={form.subject || ''} onChange={setF('subject')} placeholder="Short summary of the issue..." style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority || 'Normal'} onChange={setF('priority')} style={inputStyle}>
                {OPTIONS.ticketPriorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description || ''} onChange={setF('description')} placeholder="Detail what happened and how we can help..." rows={4} style={{ ...inputStyle, resize: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={onSave} disabled={saving} style={{ flex: 2, padding: '10px 0', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ERPTicketsPage() {
  const { user } = useAuth();
  const { items: allTickets, loading, add } = useDB(DB_KEYS.TICKETS);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ priority: 'Normal' });
  const [saving, setSaving] = useState(false);

  // Filter tickets to only show those raised by this user
  const myTickets = useMemo(() => 
    allTickets.filter(t => t.submitterEmail === user?.email)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
  [allTickets, user]);

  const handleSave = async () => {
    if (!form.subject?.trim()) return alert('Please enter a subject');
    setSaving(true);
    const newTicket = {
      ...form,
      status: 'Open',
      source: 'CRM/HRM',
      submitterEmail: user?.email || 'Unknown User',
      submitterName: user?.name || 'System User',
    };
    await add(newTicket);
    setSaving(false);
    setModalOpen(false);
    setForm({ priority: 'Normal' });
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Open': return { bg: 'rgba(59,130,246,0.1)', color: T.brand.indigo };
      case 'In Progress': return { bg: 'rgba(245,158,11,0.1)', color: T.brand.orange };
      case 'Resolved': return { bg: 'rgba(16,185,129,0.1)', color: T.status.success };
      case 'Closed': return { bg: 'rgba(107,114,128,0.1)', color: T.text.muted };
      default: return { bg: 'rgba(107,114,128,0.1)', color: T.text.muted };
    }
  };

  return (
    <div>
      <PageHeader 
        title="Support & Feedback" 
        subtitle="Report issues or suggest improvements for your business system."
        right={<button onClick={() => setModalOpen(true)} style={{ padding: '9px 18px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ New Ticket</button>}
      />

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading tickets...</div>
        ) : myTickets.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text.primary }}>No support tickets yet</div>
            <p style={{ fontSize: 13, marginTop: 4 }}>Need help? Raise a ticket and our team will get back to you.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['Ticket ID', 'Subject', 'Priority', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myTickets.map((t, idx) => {
                const style = getStatusStyle(t.status);
                return (
                  <tr key={t.id} style={{ borderTop: `1px solid ${T.border.light}`, background: idx % 2 === 0 ? 'transparent' : T.surface.page }}>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: T.text.muted, fontFamily: T.fonts.mono }}>#{t.id?.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: T.text.primary }}>{t.subject}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.text.muted }}>{t.priority}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: style.bg, color: style.color, padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>{t.status || 'Open'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: T.text.muted }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && <Modal title="Raise Support Ticket" onClose={() => setModalOpen(false)} onSave={handleSave} form={form} setForm={setForm} saving={saving} />}
    </div>
  );
}
