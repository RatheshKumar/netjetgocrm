// =============================================================================
// src/pages/erp/InventoryPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS, DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };

function Modal({ title, onClose, onSave, form, setForm, isEdit }) {
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Product Name', 'name', 'text', 'e.g. Samsung TV 43"'],
              ['SKU / Barcode', 'sku', 'text', 'e.g. SKU-001'],
              ['Cost Price (₹)', 'costPrice', 'number', '0'],
              ['Selling Price (₹)', 'sellingPrice', 'number', '0'],
              ['Stock Qty', 'stock', 'number', '0'],
              ['Low Stock Alert', 'lowStockThreshold', 'number', '5'],
            ].map(([label, key, type, placeholder]) => (
              <div key={key} style={{ gridColumn: key === 'name' ? 'span 2' : '' }}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={setF(key)} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Category</label>
              <select value={form.category || ''} onChange={setF('category')} style={inputStyle}>
                <option value="">Select category</option>
                {OPTIONS.erpInventoryCategories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description || ''} onChange={setF('description')} placeholder="Product description…" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <input type="text" value={form.unit || ''} onChange={setF('unit')} placeholder="pcs / kg / litre" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Supplier Name</label>
              <input type="text" value={form.supplier || ''} onChange={setF('supplier')} placeholder="Supplier name" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={onSave} style={{ flex: 2, padding: '10px 0', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function stockBadge(item) {
  const qty = item.stock || 0;
  const thresh = item.lowStockThreshold || 5;
  if (qty === 0) return { label: 'Out of Stock', bg: 'rgba(239,68,68,0.1)', text: T.status.danger };
  if (qty <= thresh) return { label: 'Low Stock', bg: 'rgba(245,158,11,0.1)', text: T.status.warning };
  return { label: 'In Stock', bg: 'rgba(16,185,129,0.1)', text: T.status.success };
}

export default function InventoryPage() {
  const { items, loading, add, update, remove } = useDB(DB_KEYS.ERP_INVENTORY);
  const [modal, setModal] = useState(null); // null | 'add' | item
  const [form,  setForm]  = useState({});
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const openAdd = () => { setForm({}); setModal('add'); };
  const openEdit = item => { setForm({ ...item }); setModal(item); };
  const close = () => { setModal(null); setForm({}); };

  const save = async () => {
    if (!form.name?.trim()) return;
    const data = { ...form, stock: Number(form.stock) || 0, costPrice: Number(form.costPrice) || 0, sellingPrice: Number(form.sellingPrice) || 0, lowStockThreshold: Number(form.lowStockThreshold) || 5 };
    if (modal === 'add') await add(data);
    else await update(modal.id, data);
    close();
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q);
    const matchCat = !catFilter || i.category === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${items.length} products · ${items.reduce((s, i) => s + (i.stock || 0), 0)} total units`}
        right={<button onClick={openAdd} style={{ padding: '9px 18px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Product</button>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or SKU…" style={{ ...inputStyle, flex: 1, maxWidth: 320 }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ ...inputStyle, width: 180 }}>
          <option value="">All Categories</option>
          {OPTIONS.erpInventoryCategories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted, fontSize: 13 }}>Loading inventory…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No products found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Click "Add Product" to start building your inventory</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['Product', 'SKU', 'Category', 'Stock', 'Cost', 'Sell Price', 'Margin', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const badge = stockBadge(item);
                const margin = item.sellingPrice > 0 && item.costPrice > 0 ? (((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100).toFixed(1) : null;
                return (
                  <tr key={item.id} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary }}>{item.name}</div>
                      <div style={{ fontSize: 10, color: T.text.muted, marginTop: 1 }}>{item.unit || 'pcs'} · {item.supplier || '—'}</div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted, fontFamily: T.fonts.mono }}>{item.sku || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{item.category || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: T.text.primary }}>{item.stock || 0}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>₹{(item.costPrice || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: T.text.primary }}>₹{(item.sellingPrice || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>{margin ? <span style={{ color: T.status.success, fontWeight: 600 }}>{margin}%</span> : '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: badge.bg, color: badge.text, borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{badge.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(item)} style={{ padding: '4px 10px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => remove(item.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && <Modal title={modal === 'add' ? 'Add New Product' : 'Edit Product'} onClose={close} onSave={save} form={form} setForm={setForm} isEdit={modal !== 'add'} />}
    </div>
  );
}
