// src/pages/hrm/AttendancePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const DEFAULT_FORM = { employeeName: '', date: new Date().toISOString().split('T')[0], clockIn: '', clockOut: '', status: 'Present', notes: '' };

const statusStyle = {
  Present:  { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  Absent:   { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626' },
  Late:     { bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  'Half Day': { bg: 'rgba(59,130,246,0.12)', color: '#2563EB' },
  'Work From Home': { bg: 'rgba(99,102,241,0.12)', color: '#4F46E5' },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM, employeeName: user?.name || '' });
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const isAdmin = ['Admin', 'CEO / Founder', 'HR Manager'].includes(user?.role);

  const fetchAttendance = useCallback(() => {
    setLoading(true);
    let url = dateFilter
      ? `${API_BASE}/api/hrm/attendance?date=${dateFilter}`
      : `${API_BASE}/api/hrm/attendance`;
    
    // Add user filter if not admin
    if (!isAdmin && user?.name) {
      url += (url.includes('?') ? '&' : '?') + `employeeName=${encodeURIComponent(user.name)}`;
    }

    fetch(url, { headers: authHeader() })
      .then(r => r.json()).then(data => { setRecords(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateFilter, isAdmin, user?.name]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const calcHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null;
    const [h1, m1] = clockIn.split(':').map(Number);
    const [h2, m2] = clockOut.split(':').map(Number);
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
  };

  const handleSave = async () => {
    if (!form.employeeName || !form.date) return alert('Employee name and date required');
    setSaving(true);
    try {
      const hoursWorked = calcHours(form.clockIn, form.clockOut);
      await fetch(`${API_BASE}/api/hrm/attendance`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, hoursWorked })
      });
      setModal(false); setForm(DEFAULT_FORM); fetchAttendance();
    } finally { setSaving(false); }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    await fetch(`${API_BASE}/api/hrm/attendance/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchAttendance();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const present = records.filter(r => r.status === 'Present').length;
  const absent = records.filter(r => r.status === 'Absent').length;
  const late = records.filter(r => r.status === 'Late').length;

  return (
    <div>
      <PageHeader title="Attendance Tracker" subtitle="Monitor daily employee attendance and working hours.">
        <Button onClick={() => setModal(true)}>+ Mark Attendance</Button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Records" val={records.length} color={T.brand.indigo} />
        <StatCard label="Present" val={present} color={T.status.success} />
        <StatCard label="Absent" val={absent} color={T.status.danger} />
        <StatCard label="Late" val={late} color={T.status.warning} />
      </div>

      {/* Date Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: T.text.muted }}>Filter by Date:</label>
        <input
          type="date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{ padding: '8px 14px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, fontFamily: 'inherit', color: T.text.primary }}
        />
        <button onClick={() => setDateFilter('')} style={{ padding: '8px 16px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, background: 'transparent', cursor: 'pointer', fontSize: 13, color: T.text.muted }}>
          Show All
        </button>
      </div>

      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              {['Employee','Date','Clock In','Clock Out','Hours','Status','Notes','Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>No attendance records. Click "+ Mark Attendance" to begin.</td></tr>
            ) : records.map(r => {
              const ss = statusStyle[r.status] || statusStyle.Present;
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.employeeName}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: T.text.muted }}>{new Date(r.date).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.clockIn || '—'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 13 }}>{r.clockOut || '—'}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: T.brand.indigo }}>{r.hoursWorked ? `${parseFloat(r.hoursWorked).toFixed(1)}h` : '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: T.text.muted }}>{r.notes || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {isAdmin && <button onClick={() => deleteRecord(r.id)} style={{ padding: '5px 12px', background: 'transparent', border: `1px solid ${T.border.medium}`, borderRadius: T.radius.sm, fontSize: 11, color: T.text.muted, cursor: 'pointer' }}>Delete</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Mark Attendance" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Saving...' : 'Save Record'}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Employee Name *" value={form.employeeName} onChange={setField('employeeName')} placeholder="Full name" disabled={!isAdmin} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Date *" type="date" value={form.date} onChange={setField('date')} />
              <Select label="Status" value={form.status} onChange={setField('status')}>
                {['Present','Absent','Late','Half Day','Work From Home'].map(s => <option key={s}>{s}</option>)}
              </Select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Clock In" type="time" value={form.clockIn} onChange={setField('clockIn')} />
              <Input label="Clock Out" type="time" value={form.clockOut} onChange={setField('clockOut')} />
            </div>
            <Input label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Any notes..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
