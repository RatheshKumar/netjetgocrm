// src/pages/crm/MarketingPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import StatCard from '../../components/ui/StatCard';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const CHANNELS = ['Email', 'Social Media', 'Google Ads', 'LinkedIn', 'Cold Outreach', 'Webinar', 'Event', 'SEO', 'Other'];
const STATUSES = ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'];
const DEFAULT_FORM = { name: '', channel: 'Email', status: 'Draft', budget: '', leads: '', startDate: '', endDate: '', description: '' };

const statusStyle = {
  Draft:     { bg: 'rgba(107,114,128,0.12)', color: '#6B7280' },
  Active:    { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  Paused:    { bg: 'rgba(245,158,11,0.12)',  color: '#D97706' },
  Completed: { bg: 'rgba(59,130,246,0.12)',  color: '#2563EB' },
  Cancelled: { bg: 'rgba(239,68,68,0.12)',   color: '#DC2626' },
};

const channelIcon = { Email:'📧', 'Social Media':'📱', 'Google Ads':'🎯', LinkedIn:'💼', 'Cold Outreach':'📞', Webinar:'🎥', Event:'🎪', SEO:'🔍', Other:'📢' };

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/crm/campaigns`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setCampaigns(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setModal(true); };
  const openEdit = c => { setForm({ name: c.name, channel: c.channel, status: c.status, budget: c.budget, leads: c.leads, startDate: c.startDate?.split('T')[0]||'', endDate: c.endDate?.split('T')[0]||'', description: c.description||'' }); setEditItem(c); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return alert('Campaign name required');
    setSaving(true);
    try {
      if (editItem) {
        await fetch(`${API_BASE}/api/crm/campaigns/${editItem.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(form) });
      } else {
        await fetch(`${API_BASE}/api/crm/campaigns`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      }
      setModal(false); fetchCampaigns();
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this campaign?')) return;
    await fetch(`${API_BASE}/api/crm/campaigns/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchCampaigns();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const active = campaigns.filter(c => c.status === 'Active').length;
  const totalBudget = campaigns.reduce((a, c) => a + (parseFloat(c.budget)||0), 0);
  const totalLeads = campaigns.reduce((a, c) => a + (parseInt(c.leads)||0), 0);

  return (
    <div>
      <PageHeader title="Marketing Campaigns" subtitle="Plan, track and manage your marketing campaigns.">
        <Button onClick={openAdd}>+ New Campaign</Button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Campaigns" val={campaigns.length} color={T.brand.indigo} />
        <StatCard label="Active" val={active} color={T.status.success} />
        <StatCard label="Total Budget" val={`$${totalBudget.toLocaleString()}`} color={T.brand.pink} />
        <StatCard label="Total Leads" val={totalLeads} color={T.brand.orange} />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {campaigns.length === 0 ? (
            <div style={{ gridColumn:'1/-1', padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📣</div>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No campaigns yet</h3>
              <p style={{ color: T.text.muted, marginBottom: 20 }}>Create your first marketing campaign to start tracking leads.</p>
              <Button onClick={openAdd}>+ New Campaign</Button>
            </div>
          ) : campaigns.map(c => {
            const ss = statusStyle[c.status] || statusStyle.Draft;
            const icon = channelIcon[c.channel] || '📢';
            return (
              <div key={c.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${T.brand.indigoGlow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>{c.status}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>{c.name}</h3>
                <div style={{ fontSize: 13, color: T.text.muted, marginBottom: 12 }}>{c.channel}</div>
                {c.description && <p style={{ fontSize: 13, color: T.text.muted, lineHeight: 1.5, marginBottom: 16 }}>{c.description}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: T.surface.page, borderRadius: T.radius.md, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: T.text.subtle, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Budget</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.brand.pink }}>${parseFloat(c.budget||0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: T.surface.page, borderRadius: T.radius.md, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: T.text.subtle, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Leads</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.status.success }}>{c.leads || 0}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '8px', background: T.brand.indigoLight, color: T.brand.indigo, border: 'none', borderRadius: T.radius.sm, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} style={{ flex: 1, padding: '8px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: 'none', borderRadius: T.radius.sm, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={editItem ? 'Edit Campaign' : 'New Campaign'} onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Saving...' : 'Save Campaign'} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ gridColumn: '1/-1' }}><Input label="Campaign Name *" value={form.name} onChange={setField('name')} placeholder="e.g. Q4 Lead Generation" /></div>
            <Select label="Channel" value={form.channel} onChange={setField('channel')}>
              {CHANNELS.map(ch => <option key={ch}>{ch}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={setField('status')}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </Select>
            <Input label="Budget ($)" type="number" value={form.budget} onChange={setField('budget')} placeholder="0" />
            <Input label="Leads Generated" type="number" value={form.leads} onChange={setField('leads')} placeholder="0" />
            <Input label="Start Date" type="date" value={form.startDate} onChange={setField('startDate')} />
            <Input label="End Date" type="date" value={form.endDate} onChange={setField('endDate')} />
            <div style={{ gridColumn: '1/-1' }}><Textarea label="Description" value={form.description} onChange={setField('description')} placeholder="Campaign details, goals and notes..." /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
