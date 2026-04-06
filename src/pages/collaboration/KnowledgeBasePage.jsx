// src/pages/collaboration/KnowledgeBasePage.jsx
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

const CATEGORIES = ['General', 'CRM', 'HRM', 'IT', 'Finance', 'Operations', 'HR Policy', 'Onboarding'];
const DEFAULT_FORM = { title: '', content: '', category: 'General', tags: '' };
const catIcons = { General:'📄', CRM:'💼', HRM:'👥', IT:'💻', Finance:'💰', Operations:'⚙️', 'HR Policy':'📋', Onboarding:'🎓' };
const catColor = { General:'#6B7280', CRM:'#3D3BAF', HRM:'#10B981', IT:'#3B82F6', Finance:'#F59E0B', Operations:'#8B5CF6', 'HR Policy':'#E8197A', Onboarding:'#F97316' };

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [search, setSearch] = useState('');

  const isAdmin = ['Admin', 'CEO / Founder', 'HR'].includes(user?.role);

  const fetchArticles = useCallback(() => {
    setLoading(true);
    const url = catFilter !== 'All' ? `${API_BASE}/api/collab/articles?category=${catFilter}` : `${API_BASE}/api/collab/articles`;
    fetch(url, { headers: authHeader() })
      .then(r => r.json()).then(data => { setArticles(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [catFilter]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openAdd  = ()  => { setForm(DEFAULT_FORM); setEditItem(null); setModal(true); };
  const openEdit = (a) => { setForm({ title: a.title, content: a.content||'', category: a.category, tags: a.tags||'' }); setEditItem(a); setModal(true); };

  const handleSave = async () => {
    if (!form.title) return alert('Title required');
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`${API_BASE}/api/collab/articles/${editItem.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(form) });
      } else {
        await fetch(`${API_BASE}/api/collab/articles`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ ...form, authorName: user?.name, authorId: user?.id }) });
      }
      setModal(false); fetchArticles();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    await fetch(`${API_BASE}/api/collab/articles/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchArticles();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = articles.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.tags||'').toLowerCase().includes(search.toLowerCase()));

  if (viewItem) {
    return (
      <div>
        <button onClick={() => setViewItem(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: T.brand.indigo, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 24, padding: 0 }}>← Back to Knowledge Base</button>
        <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 40, maxWidth: 800 }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${catColor[viewItem.category]||T.brand.indigo}18`, color: catColor[viewItem.category]||T.brand.indigo }}>{viewItem.category}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16 }}>{viewItem.title}</h1>
          <div style={{ fontSize: 13, color: T.text.subtle, marginBottom: 24 }}>By {viewItem.authorName || 'Admin'} · {new Date(viewItem.createdAt).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'})}</div>
          <div style={{ fontSize: 15, color: T.text.muted, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{viewItem.content || 'No content available.'}</div>
          {viewItem.tags && <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${T.border.light}` }}>
            <span style={{ fontSize: 12, color: T.text.subtle }}>Tags: </span>
            {viewItem.tags.split(',').map(t => <span key={t} style={{ marginLeft: 6, padding: '2px 10px', background: T.brand.indigoLight, color: T.brand.indigo, borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t.trim()}</span>)}
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="Browse internal documentation, guides and policies.">
        {isAdmin && <Button onClick={openAdd}>+ Write Article</Button>}
      </PageHeader>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ flex: 1, minWidth: 200, padding: '10px 16px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 14, fontFamily: 'inherit', color: T.text.primary, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 14px', borderRadius: 20, border: catFilter === c ? 'none' : `1px solid ${T.border.light}`, background: catFilter === c ? T.brand.indigo : T.surface.card, color: catFilter === c ? '#fff' : T.text.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading articles...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No articles found</h3>
          {isAdmin && <><p style={{ color: T.text.muted, marginBottom: 20 }}>Start building your knowledge base.</p><Button onClick={openAdd}>+ Write Article</Button></>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(a => {
            const ic = catIcons[a.category] || '📄';
            const cc = catColor[a.category] || T.brand.indigo;
            return (
              <div key={a.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, cursor: 'pointer', transition: '0.2s' }}
                onClick={() => setViewItem(a)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${T.brand.indigoGlow}`; e.currentTarget.style.borderColor = `${T.brand.indigo}40`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border.light; }}>
                <div style={{ width: 44, height: 44, borderRadius: T.radius.md, background: `${cc}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{ic}</div>
                <span style={{ fontSize: 10, fontWeight: 800, color: cc, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.category}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: '8px 0 10px', color: T.text.primary }}>{a.title}</h3>
                <p style={{ fontSize: 13, color: T.text.muted, lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.content || 'Click to read article...'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: T.text.subtle }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    {isAdmin && <button onClick={() => openEdit(a)} style={{ padding: '4px 10px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Edit</button>}
                    {isAdmin && <button onClick={() => handleDelete(a.id)} style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editItem ? 'Edit Article' : 'Write Article'} onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Saving...' : 'Publish Article'} wide>
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Title *" value={form.title} onChange={setField('title')} placeholder="Article title..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Category" value={form.category} onChange={setField('category')}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </Select>
              <Input label="Tags (comma separated)" value={form.tags} onChange={setField('tags')} placeholder="e.g. hr, policy, leave" />
            </div>
            <Textarea label="Content" value={form.content} onChange={setField('content')} placeholder="Write the full article content here..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
