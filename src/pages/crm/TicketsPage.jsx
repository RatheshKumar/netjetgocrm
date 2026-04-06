// src/pages/crm/TicketsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'Normal' });

  const isSupport = ['Admin', 'CEO / Founder', 'Support Agent'].includes(user?.role);
  const isAdmin = ['Admin', 'CEO / Founder'].includes(user?.role);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/crm/tickets`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setTickets(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSave = async () => {
    if (!form.subject) return alert('Subject required');
    await fetch(`${API_BASE}/api/crm/tickets`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
    setModal(false); setForm({ subject: '', description: '', priority: 'Normal' }); fetchTickets();
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/crm/tickets/${id}`, { method: 'PATCH', headers: authHeader(), body: JSON.stringify({ status }) });
    fetchTickets();
  };

  return (
    <div>
      <PageHeader title="Support Tickets" subtitle="Manage customer requests and issues">
        <Button onClick={() => setModal(true)}>+ New Ticket</Button>
      </PageHeader>
      
      {loading ? <div>Loading...</div> : (
        <table style={{ width: '100%', background: T.surface.card, borderRadius: T.radius.lg, borderCollapse: 'collapse', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: T.surface.page, borderBottom: `1px solid ${T.border.light}` }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: T.text.muted }}>Subject</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: T.text.muted }}>Priority</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: T.text.muted }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: T.text.muted }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center' }}>No tickets found</td></tr> : tickets.map(t => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{t.subject}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.priority}</td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.status}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  {isSupport && t.status !== 'Closed' && <button onClick={() => updateStatus(t.id, 'Closed')} style={{ padding: '5px 10px', background: T.status.success, color: '#fff', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12 }}>Close</button>}
                  {isAdmin && <button onClick={async () => { if(!window.confirm('Delete ticket?')) return; await fetch(`${API_BASE}/api/crm/tickets/${t.id}`, { method: 'DELETE', headers: authHeader() }); fetchTickets(); }} style={{ padding: '5px 10px', background: T.status.danger, color: '#fff', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>}
                  {!isSupport && <span style={{ color: T.text.muted, fontSize: 12 }}>Read-Only</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <Modal title="New Ticket" onClose={() => setModal(false)} onSave={handleSave}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Subject *" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {['Low', 'Normal', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
            </Select>
            <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </Modal>
      )}
    </div>
  );
}
