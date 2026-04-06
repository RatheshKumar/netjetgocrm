// src/pages/collaboration/MeetingPortalPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const DEFAULT_FORM = { title: '', description: '', meetingDate: '', meetingTime: '', duration: 60, location: '', meetLink: '' };
const statusStyle = {
  Scheduled: { bg: 'rgba(59,130,246,0.10)', color: '#2563EB' },
  Ongoing:   { bg: 'rgba(16,185,129,0.10)', color: '#059669' },
  Completed: { bg: 'rgba(107,114,128,0.10)', color: '#6B7280' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  color: '#DC2626' },
};

export default function MeetingPortalPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('upcoming');

  const fetchMeetings = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/collab/meetings`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setMeetings(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleSave = async () => {
    if (!form.title || !form.meetingDate || !form.meetingTime) return alert('Title, date and time are required');
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/collab/meetings`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, organizer: user?.name, organizerId: user?.id })
      });
      setModal(false); setForm(DEFAULT_FORM); fetchMeetings();
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await fetch(`${API_BASE}/api/collab/meetings/${id}/status`, { method: 'PATCH', headers: authHeader(), body: JSON.stringify({ status }) });
    fetchMeetings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this meeting?')) return;
    await fetch(`${API_BASE}/api/collab/meetings/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchMeetings();
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const today = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter(m => m.meetingDate >= today && m.status !== 'Cancelled' && m.status !== 'Completed');
  const past     = meetings.filter(m => m.meetingDate < today || m.status === 'Completed' || m.status === 'Cancelled');
  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div>
      <PageHeader title="Meeting Portal" subtitle="Schedule, join and manage team meetings.">
        <Button onClick={() => setModal(true)}>+ Schedule Meeting</Button>
      </PageHeader>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['upcoming','📅 Upcoming'], ['past','🕐 Past']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '8px 20px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: tab === key ? T.brand.indigo : T.surface.card,
            color: tab === key ? '#fff' : T.text.muted,
            border: tab === key ? 'none' : `1px solid ${T.border.light}`,
          }}>{label} ({(tab === key ? displayed : (key === 'upcoming' ? upcoming : past)).length})</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading meetings...</div>
      ) : displayed.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No {tab} meetings</h3>
          {tab === 'upcoming' && <><p style={{ color: T.text.muted, marginBottom: 20 }}>Schedule your first meeting to get started.</p><Button onClick={() => setModal(true)}>+ Schedule Meeting</Button></>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map(m => {
            const ss = statusStyle[m.status] || statusStyle.Scheduled;
            const isToday = m.meetingDate === today;
            return (
              <div key={m.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${isToday ? T.brand.indigo + '40' : T.border.light}`, padding: 24, display: 'flex', alignItems: 'center', gap: 24, transition: '0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${T.brand.indigoGlow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                {/* Date block */}
                <div style={{ minWidth: 70, textAlign: 'center', background: isToday ? T.brand.indigo : T.surface.page, borderRadius: T.radius.md, padding: '12px 8px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: isToday ? 'rgba(255,255,255,0.7)' : T.text.muted, textTransform: 'uppercase' }}>
                    {new Date(m.meetingDate).toLocaleDateString('en',{month:'short'})}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: isToday ? '#fff' : T.text.primary, lineHeight: 1 }}>
                    {new Date(m.meetingDate).getDate()}
                  </div>
                  <div style={{ fontSize: 10, color: isToday ? 'rgba(255,255,255,0.7)' : T.text.muted }}>{m.meetingTime}</div>
                </div>
                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800 }}>{m.title}</h3>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: ss.bg, color: ss.color }}>{m.status}</span>
                    {isToday && <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(232,25,122,0.1)', color: T.brand.pink }}>Today</span>}
                  </div>
                  {m.description && <p style={{ fontSize: 13, color: T.text.muted, marginBottom: 8 }}>{m.description}</p>}
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text.subtle }}>
                    <span>🕐 {m.duration} min</span>
                    {m.location && <span>📍 {m.location}</span>}
                    <span>👤 {m.organizer}</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column', minWidth: 140 }}>
                  {m.meetLink && <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: T.brand.indigo, color: '#fff', borderRadius: T.radius.md, fontSize: 12, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>Join Meeting →</a>}
                  {m.status === 'Scheduled' && <button onClick={() => updateStatus(m.id, 'Completed')} style={{ padding: '6px 12px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 12, cursor: 'pointer', color: T.text.muted }}>Mark Done</button>}
                  <button onClick={() => handleDelete(m.id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.07)', border: 'none', borderRadius: T.radius.md, fontSize: 12, cursor: 'pointer', color: T.status.danger }}>Cancel</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title="Schedule Meeting" onClose={() => setModal(false)} onSave={handleSave} saveLabel={saving ? 'Scheduling...' : 'Schedule Meeting'} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div style={{ gridColumn: '1/-1' }}><Input label="Meeting Title *" value={form.title} onChange={setField('title')} placeholder="e.g. Q4 Sales Review" /></div>
            <Input label="Date *" type="date" value={form.meetingDate} onChange={setField('meetingDate')} />
            <Input label="Time *" type="time" value={form.meetingTime} onChange={setField('meetingTime')} />
            <Input label="Duration (min)" type="number" value={form.duration} onChange={setField('duration')} />
            <Input label="Location" value={form.location} onChange={setField('location')} placeholder="Room / Online" />
            <div style={{ gridColumn: '1/-1' }}><Input label="Meeting Link (Zoom/Meet)" value={form.meetLink} onChange={setField('meetLink')} placeholder="https://meet.google.com/..." /></div>
            <div style={{ gridColumn: '1/-1' }}><Textarea label="Description" value={form.description} onChange={setField('description')} placeholder="Agenda and notes..." /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
