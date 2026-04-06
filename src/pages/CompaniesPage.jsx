// src/pages/CompaniesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../config/theme';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const T = theme;
const DEFAULT_FORM = { name: '', industry: '', website: '', phone: '', assignedTo: '' };
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}` });

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM, assignedTo: user?.name || '' });

  const isAdmin = ['Admin', 'CEO / Founder'].includes(user?.role);
  const canDelete = isAdmin || ['Sales Representative'].includes(user?.role);

  const fetchCompanies = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/crm/companies`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => { setCompanies(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleSave = async () => {
    if (!form.name) return alert('Company Name is required');
    await fetch(`${API_BASE}/api/crm/companies`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setModal(false);
    setForm(DEFAULT_FORM);
    fetchCompanies();
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this company?')) return;
    await fetch(`${API_BASE}/api/crm/companies/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchCompanies();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader 
        title="Companies" 
        subtitle="Manage B2B accounts and clients." 
        right={<Button onClick={() => setModal(true)}>+ New Company</Button>}
      />

      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Industry</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Website</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center' }}>Loading...</td></tr> : 
             companies.length === 0 ? <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center' }}>No companies yet.</td></tr> :
             companies.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, color: T.text.primary }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: T.text.muted }}>{c.phone}</div>
                </td>
                <td style={{ padding: 16, fontSize: 13 }}>{c.industry}</td>
                <td style={{ padding: 16, fontSize: 13 }}><a href={c.website} target="_blank" rel="noreferrer" style={{color: T.brand.indigo}}>{c.website}</a></td>
                <td style={{ padding: 16 }}>
                  {canDelete && <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>Delete</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Add New Company" onClose={() => setModal(false)} onSave={handleSave}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Company Name *" value={form.name} onChange={setField('name')} placeholder="Acme Corp" />
            <Input label="Industry" value={form.industry} onChange={setField('industry')} placeholder="Technology" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Website" value={form.website} onChange={setField('website')} placeholder="https://..." />
              <Input label="Phone" value={form.phone} onChange={setField('phone')} />
            </div>
            <Input label="Assigned To" value={form.assignedTo} onChange={setField('assignedTo')} placeholder="Owner Name" disabled={!isAdmin} />
          </div>
        </Modal>
      )}
    </div>
  );
}
