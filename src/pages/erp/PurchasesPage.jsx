// =============================================================================
// src/pages/erp/PurchasesPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS, DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };

const statusColors = {
  Draft:      { bg: 'rgba(107,114,128,0.1)', text: '#6B7280' },
  Ordered:    { bg: 'rgba(59,130,246,0.1)',  text: '#2563EB' },
  Received:   { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  Partial:    { bg: 'rgba(245,158,11,0.1)',  text: '#D97706' },
  Cancelled:  { bg: 'rgba(239,68,68,0.1)',   text: '#DC2626' },
};

function PurchaseModal({ onClose, onSave, form, setForm, isEdit, suppliers }) {
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const [lines, setLines] = useState(form.lineItems || [{ productName: '', qty: 1, unitCost: 0 }]);

  const updateLine = (i, k, v) => {
    const updated = lines.map((l, idx) => idx === i ? { ...l, [k]: v } : l);
    setLines(updated);
    setForm(p => ({ ...p, lineItems: updated }));
  };

  const addLine = () => {
    const updated = [...lines, { productName: '', qty: 1, unitCost: 0 }];
    setLines(updated);
    setForm(p => ({ ...p, lineItems: updated }));
  };

  const removeLine = i => {
    const updated = lines.filter((_, idx) => idx !== i);
    setLines(updated);
    setForm(p => ({ ...p, lineItems: updated }));
  };

  const total = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{isEdit ? 'Edit Purchase Order' : 'New Purchase Order'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Supplier</label>
              <select value={form.supplierName || ''} onChange={setF('supplierName')} style={inputStyle}>
                <option value="">Select or type supplier…</option>
                {suppliers.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Order Date</label>
              <input type="date" value={form.orderDate || ''} onChange={setF('orderDate')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expected Delivery</label>
              <input type="date" value={form.expectedDate || ''} onChange={setF('expectedDate')} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status || 'Draft'} onChange={setF('status')} style={inputStyle}>
                {OPTIONS.erpPurchaseStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Reference #</label>
              <input type="text" value={form.reference || ''} onChange={setF('reference')} placeholder="PO-001" style={inputStyle} />
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={labelStyle}>Items Ordered</label>
              <button onClick={addLine} style={{ fontSize: 11, color: T.brand.indigo, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>+ Add Line</button>
            </div>
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px 30px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input placeholder="Product name" value={line.productName} onChange={e => updateLine(i, 'productName', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Qty" min={1} value={line.qty} onChange={e => updateLine(i, 'qty', e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Unit cost" min={0} value={line.unitCost} onChange={e => updateLine(i, 'unitCost', e.target.value)} style={inputStyle} />
                <button onClick={() => removeLine(i)} style={{ background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, cursor: 'pointer', fontSize: 14, padding: '4px' }}>✕</button>
              </div>
            ))}
            <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: T.text.primary, marginTop: 8 }}>
              Total: ₹{total.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes || ''} onChange={setF('notes')} placeholder="Additional notes…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={() => onSave(total)} style={{ flex: 2, padding: '10px 0', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {isEdit ? 'Save Changes' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PurchasesPage() {
  const { items, loading, add, update, remove } = useDB(DB_KEYS.ERP_PURCHASES);
  const suppliers = useDB(DB_KEYS.ERP_SUPPLIERS);
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});

  const openAdd  = () => { setForm({ status: 'Draft', lineItems: [], orderDate: new Date().toISOString().slice(0, 10) }); setModal('add'); };
  const openEdit = item => { setForm({ ...item }); setModal(item); };
  const close    = () => { setModal(null); setForm({}); };

  const save = async (total) => {
    if (!form.supplierName) return;
    const data = { ...form, total };
    if (modal === 'add') await add(data);
    else await update(modal.id, data);
    close();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Purchase Orders</h2>
          <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>{items.length} orders · ₹{items.reduce((s, i) => s + (i.total || 0), 0).toLocaleString('en-IN')} total</p>
        </div>
        <button onClick={openAdd} style={{ padding: '9px 18px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ New Order</button>
      </div>

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🛒</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No purchase orders yet</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['PO #', 'Supplier', 'Items', 'Total', 'Status', 'Order Date', 'Expected', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((po, i) => {
                const badge = statusColors[po.status] || statusColors.Draft;
                return (
                  <tr key={po.id} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, color: T.brand.indigo }}>{po.reference || `PO-${po.id?.slice(-5)}`}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: T.text.primary }}>{po.supplierName}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{(po.lineItems || []).length} item(s)</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: T.text.primary }}>₹{(po.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: badge.bg, color: badge.text, borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{po.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{po.orderDate || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{po.expectedDate || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(po)} style={{ padding: '4px 10px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => remove(po.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && <PurchaseModal onClose={close} onSave={save} form={form} setForm={setForm} isEdit={modal !== 'add'} suppliers={suppliers.items} />}
    </div>
  );
}
