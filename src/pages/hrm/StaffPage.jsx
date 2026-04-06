// src/pages/hrm/StaffPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import { OPTIONS } from '../../config/db';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const DEFAULT_FORM = { name: '', email: '', department: '', role: '', status: 'Active', password: 'password123' };
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}` });

export default function StaffPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [saving, setSaving]   = useState(false);

  const canEdit = ['Admin', 'CEO / Founder', 'HR Manager'].includes(user?.role);

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/hrm/employees`, { headers: authHeader() })
      .then(res => res.json())
      .then(data => { setEmployees(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSave = async () => {
    if (!form.name || !form.email) return alert('Name and Email are required');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/hrm/employees`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModal(false);
        setForm(DEFAULT_FORM);
        fetchEmployees();
      } else {
        const err = await res.json();
        alert('Failed to add employee: ' + (err.error || 'Unknown Error'));
      }
    } catch (err) {
      alert('Failed to connect to server');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await fetch(`${API_BASE}/api/hrm/employees/${id}`, { method: 'DELETE', headers: authHeader() });
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const maskEmail = (email) => {
    if (canEdit || !email) return email;
    const [userPart, domain] = (email || '').split('@');
    if(!userPart) return email;
    return `${userPart[0]}${'*'.repeat(Math.max(1, userPart.length - 1))}@${domain}`;
  };



  return (
    <div>
      <PageHeader 
        title="Employee Directory" 
        subtitle="Manage your team and organizational hierarchy." 
        right={canEdit && <Button onClick={() => setModal(true)}>+ Add Employee</Button>}
      />

      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Department</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading employees...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>No employees found.</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, color: T.text.primary }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted }}>{maskEmail(emp.email)}</div>
                </td>
                <td style={{ padding: 16, fontSize: 13 }}>{emp.department}</td>
                <td style={{ padding: 16, fontSize: 13 }}>{emp.role}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ background: T.status.success + '20', color: T.status.success, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{emp.status}</span>
                </td>
                <td style={{ padding: 16 }}>
                  {canEdit && <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal 
          title="Add New Employee" 
          onClose={() => setModal(false)} 
          onSave={handleSave}
          saveLabel={saving ? 'Adding...' : 'Add Employee'}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Full Name *" value={form.name} onChange={setField('name')} placeholder="Jane Doe" />
            <Input label="Email Address *" value={form.email} onChange={setField('email')} placeholder="jane@company.com" />
            <Input label="Temporary Password" type="password" value={form.password} onChange={setField('password')} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Department" value={form.department} onChange={setField('department')}>
                <option value="">Select Dept...</option>
                {OPTIONS.departments.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select label="Role" value={form.role} onChange={setField('role')}>
                <option value="">Select Role...</option>
                {OPTIONS.roles.map(r => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            <Select label="Status" value={form.status} onChange={setField('status')}>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </Select>
          </div>
        </Modal>
      )}
    </div>
  );
}
