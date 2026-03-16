// =============================================================================
// src/pages/erp/SuppliersPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS, DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };

const statusColors = {
  Active:      { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  Inactive:    { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
  Blacklisted: { bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
};

function SupplierModal({ onClose, onSave, form, setForm, isEdit }) {
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Company Name', 'name', 'text', 'Wholesaler name'],
              ['Contact Person', 'contactPerson', 'text', 'Person name'],
              ['Email', 'email', 'email', 'supplier@email.com'],
              ['Phone', 'phone', 'tel', '+91 00000 00000'],
              ['GST Number', 'gstNumber', 'text', 'GST-123456'],
              ['Payment Terms', 'paymentTerms', 'text', 'Net 30'],
            ].map(([label, key, type, placeholder]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={setF(key)} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Address</label>
              <textarea value={form.address || ''} onChange={setF('address')} placeholder="Full address" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Products Supplied</label>
              <input type="text" value={form.products || ''} onChange={setF('products')} placeholder="Electronics, Clothing…" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status || 'Active'} onChange={setF('status')} style={inputStyle}>
                {OPTIONS.erpSupplierStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={onSave} style={{ flex: 2, padding: '10px 0', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {isEdit ? 'Save Changes' : 'Add Supplier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuppliersPage() {
  const { items, loading, add, update, remove } = useDB(DB_KEYS.ERP_SUPPLIERS);
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});
  const [search, setSearch] = useState('');

  const openAdd  = () => { setForm({ status: 'Active' }); setModal('add'); };
  const openEdit = item => { setForm({ ...item }); setModal(item); };
  const close    = () => { setModal(null); setForm({}); };
  const save     = async () => {
    if (!form.name?.trim()) return;
    if (modal === 'add') await add(form);
    else await update(modal.id, form);
    close();
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name?.toLowerCase().includes(q) || i.contactPerson?.toLowerCase().includes(q) || i.products?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Suppliers</h2>
          <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>{items.length} suppliers · {items.filter(i => i.status === 'Active').length} active</p>
        </div>
        <button onClick={openAdd} style={{ padding: '9px 18px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Supplier</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search suppliers…" style={{ ...inputStyle, maxWidth: 340, marginBottom: 16 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🤝</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No suppliers yet</div>
          </div>
        ) : filtered.map(sup => {
          const badge = statusColors[sup.status] || statusColors.Active;
          return (
            <div key={sup.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 18, transition: 'box-shadow 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: T.radius.md, background: `linear-gradient(135deg,${T.brand.indigo}22,${T.brand.pink}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤝</div>
                <span style={{ background: badge.bg, color: badge.text, borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{sup.status}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text.primary, marginBottom: 4 }}>{sup.name}</div>
              <div style={{ fontSize: 12, color: T.text.muted, marginBottom: 2 }}>👤 {sup.contactPerson || '—'}</div>
              <div style={{ fontSize: 12, color: T.text.muted, marginBottom: 2 }}>📧 {sup.email || '—'}</div>
              <div style={{ fontSize: 12, color: T.text.muted, marginBottom: 2 }}>📞 {sup.phone || '—'}</div>
              {sup.products && <div style={{ fontSize: 11, color: T.brand.indigo, marginTop: 8, background: T.brand.indigoLight, borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>{sup.products}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => openEdit(sup)} style={{ flex: 1, padding: '6px 0', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => remove(sup.id)} style={{ flex: 1, padding: '6px 0', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && <SupplierModal onClose={close} onSave={save} form={form} setForm={setForm} isEdit={modal !== 'add'} />}
    </div>
  );
}
