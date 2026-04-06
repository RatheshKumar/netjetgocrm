// src/pages/hrm/LeaveManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Maternity/Paternity Leave', 'Emergency Leave', 'Unpaid Leave'];
const DEFAULT_FORM = { employeeName: '', leaveType: 'Annual Leave', startDate: '', endDate: '', reason: '' };

const statusColors = {
  Pending:  { bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  Approved: { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  Rejected: { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626' },
};

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const isAdmin = ['Admin', 'CEO / Founder', 'HR Manager'].includes(user?.role);
  
  // Pre-fill form with user name for self-service
  useEffect(() => {
    if (user?.name) {
      setForm(prev => ({ ...prev, employeeName: user.name }));
    }
  }, [user?.name]);

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    let url = `${API_BASE}/api/hrm/leaves`;
    
    // Add user filter if not admin
    if (!isAdmin && user?.name) {
      url += `?employeeName=${encodeURIComponent(user.name)}`;
    }

    fetch(url, { headers: authHeader() })
      .then(r => r.json()).then(data => { setLeaves(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAdmin, user?.name]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const calcDays = (start, end) => {
    if (!start || !end) return 1;
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.round(diff) + 1);
  };

  const handleSave = async () => {
    if (!form.employeeName || !form.startDate || !form.endDate) return alert('All fields required');
    setSaving(true);
    try {
      const days = calcDays(form.startDate, form.endDate);
      await fetch(`${API_BASE}/api/hrm/leaves`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, days })
      });
      setModal(false); setForm(DEFAULT_FORM); fetchLeaves();
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/hrm/leaves/${id}/status`, {
      method: 'PATCH', headers: authHeader(),
      body: JSON.stringify({ status, approvedBy: user?.name })
    });
    fetchLeaves();
  };

  const deleteLeave = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    await fetch(`${API_BASE}/api/hrm/leaves/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchLeaves();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = filter === 'All' ? leaves : leaves.filter(l => l.status === filter);
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div>
      <PageHeader title="Leave Management" subtitle="Submit and manage employee leave requests.">
        <Button onClick={() => setModal(true)}>+ Request Leave</Button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Requests" val={leaves.length} color={T.brand.indigo} />
        <StatCard label="Pending" val={pending} color={T.status.warning} />
        <StatCard label="Approved" val={approved} color={T.status.success} />
        <StatCard label="Rejected" val={rejected} color={T.status.danger} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: filter === f ? T.brand.indigo : T.surface.card,
            color: filter === f ? '#fff' : T.text.muted,
            boxShadow: filter === f ? `0 2px 8px ${T.brand.indigoGlow}` : 'none',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              {['Employee','Leave Type','Start Date','End Date','Days','Reason','Status','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>No leave requests found.</td></tr>
            ) : filtered.map(l => {
              const sc = statusColors[l.status] || statusColors.Pending;
              return (
                <tr key={l.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{l.employeeName}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13 }}>{l.leaveType}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.text.muted }}>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.text.muted }}>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center' }}>{l.days}</td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: T.text.muted, maxWidth: 180 }}>{l.reason || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{l.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdmin && l.status === 'Pending' && <>
                        <button onClick={() => updateStatus(l.id, 'Approved')} style={{ padding: '5px 12px', background: T.status.success, color: '#fff', border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✓ Approve</button>
                        <button onClick={() => updateStatus(l.id, 'Rejected')} style={{ padding: '5px 12px', background: T.status.danger, color: '#fff', border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✕ Reject</button>
                      </>}
                      {isAdmin && <button onClick={() => deleteLeave(l.id)} style={{ padding: '5px 10px', background: 'transparent', border: `1px solid ${T.border.medium}`, borderRadius: T.radius.sm, fontSize: 11, color: T.text.muted, cursor: 'pointer' }}>Delete</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Request Leave" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Submitting...' : 'Submit Request'}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Employee Name *" value={form.employeeName} onChange={setField('employeeName')} placeholder="Your full name" disabled={!isAdmin} />
            <Select label="Leave Type *" value={form.leaveType} onChange={setField('leaveType')}>
              {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
            </Select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Start Date *" type="date" value={form.startDate} onChange={setField('startDate')} />
              <Input label="End Date *" type="date" value={form.endDate} onChange={setField('endDate')} />
            </div>
            {form.startDate && form.endDate && (
              <div style={{ padding: '10px 14px', background: T.brand.indigoLight, borderRadius: T.radius.md, fontSize: 13, color: T.brand.indigo, fontWeight: 600 }}>
                Duration: {calcDays(form.startDate, form.endDate)} day(s)
              </div>
            )}
            <Textarea label="Reason" value={form.reason} onChange={setField('reason')} placeholder="Reason for leave..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
