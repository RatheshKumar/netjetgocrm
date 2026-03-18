// src/pages/crm/LeadsPage.jsx (Modular Update)
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { OPTIONS } from '../../config/db';

const T = theme;
const DEFAULT_FORM = { name: '', email: '', status: 'New', value: 0, assignedTo: '' };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/crm/leads`, {
       headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}` }
    })
    .then(res => res.json())
    .then(data => {
      setLeads(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  }, [API_BASE]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSave = async () => {
    if (!form.name) return alert('Name is required');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/crm/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setModal(false);
        setForm(DEFAULT_FORM);
        fetchLeads();
      }
    } catch (err) {
      alert('Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader 
        title="Sales Leads" 
        subtitle="Manage and convert your potential customers." 
        right={<Button onClick={() => setModal(true)}>+ New Lead</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Leads" val={leads.length} color={T.brand.indigo} />
        <StatCard label="Qualified" val={leads.filter(l => l.status === 'Qualified').length} color={T.status.success} />
        <StatCard label="Pipeline Value" val={`$${leads.reduce((acc,l) => acc + (Number(l.value)||0), 0).toLocaleString()}`} color={T.brand.pink} />
      </div>

      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Lead Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Value</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {!loading && leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, color: T.text.primary }}>{lead.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted }}>{lead.email}</div>
                </td>
                <td style={{ padding: 16 }}>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: T.brand.indigo + '20', color: T.brand.indigo }}>{lead.status}</span>
                </td>
                <td style={{ padding: 16, fontWeight: 700 }}>${Number(lead.value).toLocaleString()}</td>
                <td style={{ padding: 16, fontSize: 12, color: T.text.muted }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {leads.length === 0 && !loading && (
              <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>No leads yet. Click "+ New Lead" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal 
          title="Create New Lead" 
          onClose={() => setModal(false)} 
          onSave={handleSave}
          saveLabel={saving ? 'Saving...' : 'Create Lead'}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Lead Name *" value={form.name} onChange={setField('name')} placeholder="Potential Client Name" />
            <Input label="Email Address" value={form.email} onChange={setField('email')} placeholder="client@example.com" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Status" value={form.status} onChange={setField('status')}>
                {OPTIONS.leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Input label="Pipeline Value ($)" type="number" value={form.value} onChange={setField('value')} />
            </div>
            <Input label="Assigned To" value={form.assignedTo} onChange={setField('assignedTo')} placeholder="Agent Name" />
          </div>
        </Modal>
      )}
    </div>
  );
}
