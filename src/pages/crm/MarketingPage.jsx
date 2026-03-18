// src/pages/crm/MarketingPage.jsx
import React, { useState } from 'react';
import theme from '../../config/theme';
import { DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const T = theme;
const DEFAULT_FORM = { name: '', type: 'Email', status: 'Active', target: '', notes: '' };

export default function MarketingPage() {
  const { items: campaigns, loading, add, remove } = useDB(DB_KEYS.CAMPAIGNS);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!form.name) return alert('Campaign name is required');
    setSaving(true);
    try {
      await add(form);
      setModal(false);
      setForm(DEFAULT_FORM);
    } catch (err) {
      alert('Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader 
        title="Marketing Automation" 
        subtitle="Campaigns, Email Marketing, and Lead Nurturing" 
        right={<Button onClick={() => setModal(true)}>Create Campaign</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: T.text.muted }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, gridColumn: '1/-1', textAlign: 'center' }}>
            <h3 style={{ color: T.text.muted }}>No active campaigns yet</h3>
            <p style={{ color: T.text.muted, fontSize: 13, marginTop: 8 }}>Launch your first marketing campaign to start nurturing leads.</p>
            <Button onClick={() => setModal(true)} style={{ marginTop: 16 }}>+ Create Campaign</Button>
          </div>
        ) : campaigns.map(cam => (
          <div key={cam.id} style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{cam.name}</h3>
                <p style={{ color: T.text.muted, fontSize: 12, marginTop: 4 }}>{cam.type} Campaign • {cam.status}</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => remove(cam.id)}>Delete</Button>
            </div>
            <p style={{ color: T.text.muted, fontSize: 13, marginTop: 12 }}>Target: {cam.target || 'All Leads'}</p>
            {cam.notes && <p style={{ fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>{cam.notes}</p>}
          </div>
        ))}

        <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, opacity: 0.6 }}>
          <h3>Social Media Integration</h3>
          <p style={{ color: T.text.muted, fontSize: 13, marginTop: 8 }}>Connect accounts: Facebook, LinkedIn, Twitter</p>
          <Button variant="secondary" style={{ marginTop: 16 }}>Manage Connections</Button>
        </div>
      </div>

      {modal && (
        <Modal 
          title="Start Marketing Campaign" 
          onClose={() => setModal(false)} 
          onSave={handleSave}
          saveLabel={saving ? 'Launching...' : 'Create Campaign'}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Campaign Name *" value={form.name} onChange={setField('name')} placeholder="e.g. Summer Newsletter 2026" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Type" value={form.type} onChange={setField('type')}>
                <option value="Email">Email</option>
                <option value="Social">Social Media</option>
                <option value="PPC">PPC Ads</option>
                <option value="SMS">SMS Marketing</option>
              </Select>
              <Select label="Status" value={form.status} onChange={setField('status')}>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Draft">Draft</option>
              </Select>
            </div>
            <Input label="Target Audience" value={form.target} onChange={setField('target')} placeholder="e.g. Qualified Leads, High-Value Clients" />
            <Textarea label="Campaign Objective" value={form.notes} onChange={setField('notes')} placeholder="What are the goals for this campaign?..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
