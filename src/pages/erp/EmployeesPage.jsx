// =============================================================================
// src/pages/erp/EmployeesPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS, DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };

const statusColors = {
  Active:       { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  'On Leave':   { bg: 'rgba(245,158,11,0.1)', text: '#D97706' },
  Terminated:  { bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
};

function EmployeeModal({ onClose, onSave, form, setForm, isEdit }) {
  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>{isEdit ? 'Edit Employee' : 'Add Employee'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              ['Full Name', 'name', 'text', 'Employee full name'],
              ['Email', 'email', 'email', 'emp@shop.com'],
              ['Phone', 'phone', 'tel', '+91 00000 00000'],
              ['Monthly Salary (₹)', 'salary', 'number', '0'],
              ['Join Date', 'joinDate', 'date', ''],
            ].map(([label, key, type, placeholder]) => (
              <div key={key} style={{ gridColumn: key === 'name' ? 'span 2' : '' }}>
                <label style={labelStyle}>{label}</label>
                <input type={type} value={form[key] || ''} onChange={setF(key)} placeholder={placeholder} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Role</label>
              <select value={form.role || ''} onChange={setF('role')} style={inputStyle}>
                <option value="">Select role</option>
                {OPTIONS.erpRoles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select value={form.department || ''} onChange={setF('department')} style={inputStyle}>
                <option value="">Select dept</option>
                {OPTIONS.erpEmployeeDepts.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status || 'Active'} onChange={setF('status')} style={inputStyle}>
                {OPTIONS.erpEmployeeStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Emergency Contact</label>
              <input type="tel" value={form.emergencyContact || ''} onChange={setF('emergencyContact')} placeholder="+91 00000 00000" style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Address</label>
              <textarea value={form.address || ''} onChange={setF('address')} placeholder="Residential address" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={onSave} style={{ flex: 2, padding: '10px 0', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function EmployeesPage() {
  const { items, loading, add, update, remove } = useDB(DB_KEYS.ERP_EMPLOYEES);
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState({});
  const [search, setSearch] = useState('');

  const openAdd  = () => { setForm({ status: 'Active', joinDate: new Date().toISOString().slice(0, 10) }); setModal('add'); };
  const openEdit = item => { setForm({ ...item }); setModal(item); };
  const close    = () => { setModal(null); setForm({}); };
  const save     = async () => {
    if (!form.name?.trim()) return;
    const data = { ...form, salary: Number(form.salary) || 0 };
    if (modal === 'add') await add(data);
    else await update(modal.id, data);
    close();
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name?.toLowerCase().includes(q) || i.role?.toLowerCase().includes(q) || i.department?.toLowerCase().includes(q);
  });

  const avatarColors = [
    `linear-gradient(135deg, ${T.brand.indigo}, ${T.brand.indigoMid})`,
    `linear-gradient(135deg, ${T.brand.pink}, ${T.brand.orange})`,
    `linear-gradient(135deg, ${T.status.info}, ${T.brand.indigo})`,
    `linear-gradient(135deg, ${T.status.success}, #0D9488)`,
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Employees</h2>
          <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>{items.length} staff · {items.filter(e => e.status === 'Active').length} active · ₹{items.filter(e => e.status === 'Active').reduce((s, e) => s + (e.salary || 0), 0).toLocaleString('en-IN')}/mo payroll</p>
        </div>
        <button onClick={openAdd} style={{ padding: '9px 18px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Employee</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search employees…" style={{ ...inputStyle, maxWidth: 340, marginBottom: 16 }} />

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No employees added yet</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['Employee', 'Role', 'Department', 'Salary', 'Join Date', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const badge = statusColors[emp.status] || statusColors.Active;
                return (
                  <tr key={emp.id} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary }}>{emp.name}</div>
                          <div style={{ fontSize: 11, color: T.text.muted }}>{emp.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{emp.role || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{emp.department || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: T.text.primary }}>₹{(emp.salary || 0).toLocaleString('en-IN')}/mo</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{emp.joinDate || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: badge.bg, color: badge.text, borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{emp.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(emp)} style={{ padding: '4px 10px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => remove(emp.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && <EmployeeModal onClose={close} onSave={save} form={form} setForm={setForm} isEdit={modal !== 'add'} />}
    </div>
  );
}
