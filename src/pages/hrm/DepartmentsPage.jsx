// src/pages/hrm/DepartmentsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const DEFAULT_FORM = { name: '', head: '', description: '' };
const DEPT_ICONS = { Sales: '💼', HR: '👥', Finance: '💰', IT: '💻', Marketing: '📣', Operations: '⚙️', Management: '🏛️', default: '🏢' };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const fetchDepts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/hrm/departments`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setDepartments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setModal(true); };
  const openEdit = (d) => { setForm({ name: d.name, head: d.head || '', description: d.description || '' }); setEditItem(d); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return alert('Department name required');
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`${API_BASE}/api/hrm/departments/${editItem.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(form) });
      } else {
        await fetch(`${API_BASE}/api/hrm/departments`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      }
      setModal(false); fetchDepts();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    await fetch(`${API_BASE}/api/hrm/departments/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchDepts();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage your company's organizational structure.">
        <Button onClick={openAdd}>+ Add Department</Button>
      </PageHeader>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {departments.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No Departments Yet</h3>
              <p style={{ color: T.text.muted, marginBottom: 20 }}>Add your first department to organize your team.</p>
              <Button onClick={openAdd}>+ Add Department</Button>
            </div>
          ) : departments.map(d => {
            const icon = DEPT_ICONS[d.name] || DEPT_ICONS.default;
            return (
              <div key={d.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, transition: '0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${T.brand.indigoGlow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: T.radius.md, background: T.brand.indigoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(d)} style={{ padding: '5px 12px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: T.radius.sm, fontSize: 11, color: T.text.muted, cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(d.id)} style={{ padding: '5px 12px', background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: T.radius.sm, fontSize: 11, color: T.status.danger, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary, marginBottom: 6 }}>{d.name}</h3>
                {d.head && <div style={{ fontSize: 13, color: T.text.muted, marginBottom: 8 }}>👤 Head: <strong>{d.head}</strong></div>}
                {d.description && <p style={{ fontSize: 13, color: T.text.muted, lineHeight: 1.5 }}>{d.description}</p>}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border.light}`, fontSize: 11, color: T.text.subtle }}>Added {new Date(d.createdAt).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editItem ? 'Edit Department' : 'Add Department'} onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Saving...' : 'Save Department'}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Department Name *" value={form.name} onChange={setField('name')} placeholder="e.g. Sales, HR, IT" />
            <Input label="Department Head" value={form.head} onChange={setField('head')} placeholder="Manager name" />
            <Textarea label="Description" value={form.description} onChange={setField('description')} placeholder="Brief description of this department..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
