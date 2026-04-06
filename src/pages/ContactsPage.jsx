// src/pages/ContactsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../config/theme';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const T = theme;
const DEFAULT_FORM = { name: '', email: '', phone: '', jobTitle: '', company: '', assignedTo: '' };
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}` });

export default function ContactsPage({ companies = [] }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM, assignedTo: user?.name || '' });
  
  const isAdmin = ['Admin', 'CEO / Founder'].includes(user?.role);
  const canDelete = isAdmin || ['Sales Representative'].includes(user?.role);

  const fetchContacts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/crm/contacts`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => { setContacts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async () => {
    if (!form.name) return alert('Name is required');
    await fetch(`${API_BASE}/api/crm/contacts`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setModal(false);
    setForm(DEFAULT_FORM);
    fetchContacts();
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this contact?')) return;
    await fetch(`${API_BASE}/api/crm/contacts/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchContacts();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader 
        title="Contacts" 
        subtitle="Manage people and relationships." 
        right={<Button onClick={() => setModal(true)}>+ New Contact</Button>}
      />

      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Job Title</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center' }}>Loading...</td></tr> : 
             contacts.length === 0 ? <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center' }}>No contacts yet.</td></tr> :
             contacts.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, color: T.text.primary }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted }}>{c.email} • {c.phone}</div>
                </td>
                <td style={{ padding: 16, fontSize: 13 }}>{c.jobTitle}</td>
                <td style={{ padding: 16, fontSize: 13 }}>{c.company}</td>
                <td style={{ padding: 16 }}>
                  {canDelete && <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Create New Contact" onClose={() => setModal(false)} onSave={handleSave}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Name *" value={form.name} onChange={setField('name')} placeholder="John Doe" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Email" value={form.email} onChange={setField('email')} />
              <Input label="Phone" value={form.phone} onChange={setField('phone')} />
            </div>
            <Input label="Job Title" value={form.jobTitle} onChange={setField('jobTitle')} />
            {companies && companies.length > 0 ? (
              <Select label="Company" value={form.company} onChange={setField('company')}>
                <option value="">None</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </Select>
            ) : (
               <Input label="Company Name" value={form.company} onChange={setField('company')} />
            )}
            <Input label="Assigned To" value={form.assignedTo} onChange={setField('assignedTo')} placeholder="Owner Name" disabled={!isAdmin} />
          </div>
        </Modal>
      )}
    </div>
  );
}
