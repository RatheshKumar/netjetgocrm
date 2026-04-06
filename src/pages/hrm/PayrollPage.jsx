// src/pages/hrm/PayrollPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_FORM = { employeeName: '', month: MONTHS[new Date().getMonth()], year: CURRENT_YEAR, basicPay: '', allowances: '', deductions: '' };

const statusStyle = {
  Pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  Paid:     { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  'On Hold':{ bg: 'rgba(239,68,68,0.12)',   color: '#DC2626' },
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [monthFilter, setMonthFilter] = useState(MONTHS[new Date().getMonth()]);

  const fetchPayrolls = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/hrm/payroll?month=${monthFilter}&year=${CURRENT_YEAR}`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setPayrolls(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [monthFilter]);

  useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);

  const handleSave = async () => {
    if (!form.employeeName || !form.basicPay) return alert('Employee name and basic pay required');
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/hrm/payroll`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      setModal(false); setForm(DEFAULT_FORM); fetchPayrolls();
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/hrm/payroll/${id}/status`, { method: 'PATCH', headers: authHeader(), body: JSON.stringify({ status }) });
    fetchPayrolls();
  };

  const deletePayroll = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    await fetch(`${API_BASE}/api/hrm/payroll/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchPayrolls();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const netCalc = form => (parseFloat(form.basicPay)||0) + (parseFloat(form.allowances)||0) - (parseFloat(form.deductions)||0);
  const totalNetPay = payrolls.reduce((acc, p) => acc + (parseFloat(p.netPay)||0), 0);
  const paid = payrolls.filter(p => p.status === 'Paid').length;
  const pending = payrolls.filter(p => p.status === 'Pending').length;

  return (
    <div>
      <PageHeader title="Payroll Management" subtitle="Process and manage employee salaries and pay runs.">
        <Button onClick={() => setModal(true)}>+ Add Pay Run</Button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Records" val={payrolls.length} color={T.brand.indigo} />
        <StatCard label="Total Net Pay" val={`$${totalNetPay.toLocaleString('en',{minimumFractionDigits:2})}`} color={T.brand.pink} />
        <StatCard label="Paid" val={paid} color={T.status.success} />
        <StatCard label="Pending" val={pending} color={T.status.warning} />
      </div>

      {/* Month Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: T.text.muted }}>Filter by Month:</label>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
          style={{ padding: '8px 14px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontFamily: 'inherit', color: T.text.primary, background: T.surface.card }}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              {['Employee','Month/Year','Basic Pay','Allowances','Deductions','Net Pay','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading...</td></tr>
            ) : payrolls.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>No payroll records for {monthFilter}. Click "+ Add Pay Run".</td></tr>
            ) : payrolls.map(p => {
              const ss = statusStyle[p.status] || statusStyle.Pending;
              const fmt = (v) => `$${parseFloat(v||0).toLocaleString('en',{minimumFractionDigits:2})}`;
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{p.employeeName}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.text.muted }}>{p.month} {p.year}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>{fmt(p.basicPay)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.status.success }}>+{fmt(p.allowances)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.status.danger }}>-{fmt(p.deductions)}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: T.brand.indigo }}>{fmt(p.netPay)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.status === 'Pending' && <button onClick={() => updateStatus(p.id,'Paid')} style={{ padding: '5px 12px', background: T.status.success, color: '#fff', border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Mark Paid</button>}
                      {p.status === 'Pending' && <button onClick={() => updateStatus(p.id,'On Hold')} style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.1)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Hold</button>}
                      <button onClick={() => deletePayroll(p.id)} style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${T.border.medium}`, borderRadius: T.radius.sm, fontSize: 11, color: T.text.muted, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add Pay Run" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Saving...' : 'Add Pay Run'}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Employee Name *" value={form.employeeName} onChange={setField('employeeName')} placeholder="Full name" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Month *" value={form.month} onChange={setField('month')}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </Select>
              <Input label="Year *" type="number" value={form.year} onChange={setField('year')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Input label="Basic Pay ($) *" type="number" value={form.basicPay} onChange={setField('basicPay')} placeholder="0.00" />
              <Input label="Allowances ($)" type="number" value={form.allowances} onChange={setField('allowances')} placeholder="0.00" />
              <Input label="Deductions ($)" type="number" value={form.deductions} onChange={setField('deductions')} placeholder="0.00" />
            </div>
            {form.basicPay && (
              <div style={{ padding: '14px 18px', background: T.brand.indigoLight, borderRadius: T.radius.md, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: T.brand.indigo, fontWeight: 600 }}>Calculated Net Pay</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: T.brand.indigo }}>${netCalc(form).toLocaleString('en',{minimumFractionDigits:2})}</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
