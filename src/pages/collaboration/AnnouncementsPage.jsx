// src/pages/collaboration/AnnouncementsPage.jsx
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

const CATEGORIES = ['General', 'HR', 'IT', 'Finance', 'Operations', 'Sales', 'Event'];
const PRIORITIES = ['Normal', 'Important', 'Urgent'];
const DEFAULT_FORM = { title: '', body: '', category: 'General', priority: 'Normal' };

const priorityStyle = {
  Normal:    { bg: 'rgba(107,114,128,0.10)', color: '#6B7280' },
  Important: { bg: 'rgba(245,158,11,0.10)',  color: '#D97706' },
  Urgent:    { bg: 'rgba(239,68,68,0.10)',   color: '#DC2626' },
};

const catColor = { General:'#3D3BAF', HR:'#10B981', IT:'#3B82F6', Finance:'#F59E0B', Operations:'#8B5CF6', Sales:'#E8197A', Event:'#F97316' };

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('All');

  const isAdmin = ['Admin', 'CEO / Founder', 'HR'].includes(user?.role);

  const fetch_ = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/collab/announcements`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleSave = async () => {
    if (!form.title) return alert('Title is required');
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/collab/announcements`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, authorName: user?.name, authorId: user?.id })
      });
      setModal(false); setForm(DEFAULT_FORM); fetch_();
    } finally { setSaving(false); }
  };

  const togglePin = async (id) => {
    await fetch(`${API_BASE}/api/collab/announcements/${id}/pin`, { method: 'PATCH', headers: authHeader() });
    fetch_();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await fetch(`${API_BASE}/api/collab/announcements/${id}`, { method: 'DELETE', headers: authHeader() });
    fetch_();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = catFilter === 'All' ? items : items.filter(i => i.category === catFilter);
  const pinned = filtered.filter(i => i.isPinned);
  const regular = filtered.filter(i => !i.isPinned);

  const AnnouncementCard = ({ item }) => {
    const ps = priorityStyle[item.priority] || priorityStyle.Normal;
    const cc = catColor[item.category] || T.brand.indigo;
    return (
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${item.isPinned ? T.brand.indigo + '40' : T.border.light}`, padding: 24, position: 'relative', transition: '0.2s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${T.brand.indigoGlow}`}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
        {item.isPinned && <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 18 }}>📌</div>}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, background: `${cc}18`, color: cc, textTransform: 'uppercase' }}>{item.category}</span>
          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: ps.bg, color: ps.color }}>{item.priority}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text.primary, marginBottom: 10 }}>{item.title}</h3>
        {item.body && <p style={{ fontSize: 14, color: T.text.muted, lineHeight: 1.6, marginBottom: 16 }}>{item.body}</p>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: T.text.subtle }}>
            By {item.authorName || 'Admin'} · {new Date(item.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => togglePin(item.id)} style={{ padding: '4px 12px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {item.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button onClick={() => handleDelete(item.id)} style={{ padding: '4px 12px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="Company Announcements" subtitle="Stay informed with the latest company-wide news and updates.">
        {isAdmin && <Button onClick={() => setModal(true)}>+ Post Announcement</Button>}
      </PageHeader>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{
            padding: '6px 18px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: catFilter === c ? T.brand.indigo : T.surface.card,
            color: catFilter === c ? '#fff' : T.text.muted,
            border: catFilter === c ? 'none' : `1px solid ${T.border.light}`,
          }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No announcements yet</h3>
          <p style={{ color: T.text.muted }}>Check back soon for company updates.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pinned.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.text.subtle, textTransform: 'uppercase', letterSpacing: 1 }}>📌 Pinned</div>
              {pinned.map(i => <AnnouncementCard key={i.id} item={i} />)}
              {regular.length > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: T.text.subtle, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 }}>Latest</div>}
            </>
          )}
          {regular.map(i => <AnnouncementCard key={i.id} item={i} />)}
        </div>
      )}

      {modal && (
        <Modal title="Post Announcement" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Posting...' : 'Post Announcement'} wide>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Title *" value={form.title} onChange={setField('title')} placeholder="Announcement headline..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Category" value={form.category} onChange={setField('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
              <Select label="Priority" value={form.priority} onChange={setField('priority')}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </Select>
            </div>
            <Textarea label="Body" value={form.body} onChange={setField('body')} placeholder="Write the full announcement message here..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
