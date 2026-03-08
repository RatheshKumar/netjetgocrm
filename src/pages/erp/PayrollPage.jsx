// =============================================================================
// src/pages/erp/PayrollPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };

const statusColors = {
  Pending: { bg: 'rgba(245,158,11,0.1)', text: '#D97706' },
  Paid:    { bg: 'rgba(16,185,129,0.1)', text: '#059669' },
  'On Hold':{ bg: 'rgba(239,68,68,0.1)', text: '#DC2626' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function RunPayrollModal({ onClose, onSave, employees }) {
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentYear  = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [year,  setYear]  = useState(currentYear);
  const [lines, setLines] = useState(
    employees.filter(e => e.status === 'Active').map(emp => ({
      employeeId: emp.id, name: emp.name, role: emp.role, baseSalary: emp.salary || 0, bonus: 0, deductions: 0, notes: '',
    }))
  );

  const updateLine = (i, k, v) => setLines(p => p.map((l, idx) => idx === i ? { ...l, [k]: v } : l));
  const total = lines.reduce((s, l) => s + (Number(l.baseSalary) || 0) + (Number(l.bonus) || 0) - (Number(l.deductions) || 0), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: T.radius.xl, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text.primary }}>Run Payroll</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: T.text.muted }}>✕</button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Year</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={inputStyle} />
            </div>
          </div>

          {lines.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: T.text.muted }}>No active employees to process.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: T.surface.page }}>
                    {['Employee', 'Base Salary', 'Bonus', 'Deductions', 'Net Pay', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const net = (Number(line.baseSalary) || 0) + (Number(line.bonus) || 0) - (Number(line.deductions) || 0);
                    return (
                      <tr key={line.employeeId} style={{ borderTop: `1px solid ${T.border.light}` }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: T.text.primary }}>{line.name}<div style={{ fontSize: 10, color: T.text.muted, fontWeight: 400 }}>{line.role}</div></td>
                        <td style={{ padding: '8px 12px' }}><input type="number" value={line.baseSalary} onChange={e => updateLine(i, 'baseSalary', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: 90 }} /></td>
                        <td style={{ padding: '8px 12px' }}><input type="number" value={line.bonus} onChange={e => updateLine(i, 'bonus', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: 80 }} /></td>
                        <td style={{ padding: '8px 12px' }}><input type="number" value={line.deductions} onChange={e => updateLine(i, 'deductions', e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: 80 }} /></td>
                        <td style={{ padding: '8px 12px', fontWeight: 800, color: T.status.success }}>₹{net.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px 12px' }}><input type="text" value={line.notes} onChange={e => updateLine(i, 'notes', e.target.value)} placeholder="Optional…" style={{ ...inputStyle, padding: '6px 8px', width: 100 }} /></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${T.border.medium}`, background: T.brand.indigoLight }}>
                    <td colSpan={4} style={{ padding: '10px 12px', fontWeight: 800, color: T.text.primary }}>Total Payroll</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: T.brand.indigo, fontSize: 14 }}>₹{total.toLocaleString('en-IN')}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#fff', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: T.text.muted }}>Cancel</button>
            <button onClick={() => onSave({ month, year, lines, total, status: 'Pending' })} style={{ flex: 2, padding: '10px 0', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Generate Payroll
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const { items, loading, add, update, remove } = useDB(DB_KEYS.ERP_PAYROLL);
  const employees = useDB(DB_KEYS.ERP_EMPLOYEES);
  const [modal, setModal] = useState(false);

  const save = async (data) => {
    await add(data);
    setModal(false);
  };

  const markPaid = async (pr) => {
    await update(pr.id, { status: 'Paid', paidAt: new Date().toISOString() });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Payroll</h2>
          <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>{items.length} payroll runs · ₹{items.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.total || 0), 0).toLocaleString('en-IN')} paid total</p>
        </div>
        <button onClick={() => setModal(true)} style={{ padding: '9px 18px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Run Payroll</button>
      </div>

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: T.text.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💰</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No payroll runs yet</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Click "Run Payroll" to process your first payroll</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['Period', 'Employees', 'Total Amount', 'Status', 'Generated', 'Paid On', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((pr, i) => {
                const badge = statusColors[pr.status] || statusColors.Pending;
                return (
                  <tr key={pr.id} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: T.text.primary }}>{pr.month} {pr.year}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: T.text.muted }}>{(pr.lines || []).length} employees</td>
                    <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 800, color: T.brand.indigo }}>₹{(pr.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: badge.bg, color: badge.text, borderRadius: 8, padding: '3px 8px', fontSize: 10, fontWeight: 700 }}>{pr.status}</span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: T.text.muted }}>{new Date(pr.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '11px 14px', fontSize: 11, color: T.text.muted }}>{pr.paidAt ? new Date(pr.paidAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {pr.status !== 'Paid' && (
                          <button onClick={() => markPaid(pr)} style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: T.status.success, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Mark Paid</button>
                        )}
                        <button onClick={() => remove(pr.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal && <RunPayrollModal onClose={() => setModal(false)} onSave={save} employees={employees.items} />}
    </div>
  );
}
