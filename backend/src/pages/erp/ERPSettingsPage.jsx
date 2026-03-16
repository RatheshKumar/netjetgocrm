// =============================================================================
// src/pages/erp/ERPSettingsPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { DB_KEYS } from '../../config/db';
import storage from '../../utils/storage';

const T = theme;
const inputStyle = { width: '100%', padding: '10px 12px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };

export default function ERPSettingsPage() {
  const { erpUser, erpLogout } = useAuth();
  const [form, setForm] = useState({ name: erpUser?.name || '', shopName: erpUser?.shopName || '', email: erpUser?.email || '' });
  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState('INR (₹)');
  const [gst, setGst] = useState('18');

  const saveProfile = async () => {
    if (!form.name.trim()) return;
    const updated = { ...erpUser, name: form.name, shopName: form.shopName };
    await storage.save(`${DB_KEYS.ERP_USERS}${erpUser.email}`, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Settings</h2>
        <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>Manage your ERP account and shop configuration</p>
      </div>

      {/* Profile Card */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 18 }}>👤 Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Shop Name</label>
            <input type="text" value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={form.email} readOnly style={{ ...inputStyle, background: T.surface.page, color: T.text.muted, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 11, color: T.text.subtle, marginTop: 4 }}>Email cannot be changed</p>
          </div>
        </div>
        {saved && (
          <div style={{ marginTop: 14, padding: '9px 13px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: T.radius.md, color: T.status.success, fontSize: 13, fontWeight: 600 }}>✅ Profile saved successfully!</div>
        )}
        <button onClick={saveProfile} style={{ marginTop: 16, padding: '9px 22px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Profile</button>
      </div>

      {/* Shop Config */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 18 }}>🏪 Shop Configuration</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} style={inputStyle}>
              {['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Default GST Rate (%)</label>
            <input type="number" value={gst} onChange={e => setGst(e.target.value)} min={0} max={100} style={inputStyle} />
          </div>
        </div>
        <button onClick={() => {}} style={{ marginTop: 16, padding: '9px 22px', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Save Config</button>
      </div>

      {/* Account Info */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 16 }}>🔐 Account</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: T.surface.page, borderRadius: T.radius.md, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: T.text.muted }}>Role</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, marginTop: 2 }}>{erpUser?.role}</div>
          </div>
          <div style={{ flex: 1, background: T.surface.page, borderRadius: T.radius.md, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: T.text.muted }}>Member Since</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, marginTop: 2 }}>{erpUser?.createdAt ? new Date(erpUser.createdAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>
        <button onClick={erpLogout} style={{ marginTop: 16, padding: '9px 22px', background: 'rgba(239,68,68,0.08)', color: T.status.danger, border: `1px solid rgba(239,68,68,0.2)`, borderRadius: T.radius.md, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          🚪 Sign Out of ERP
        </button>
      </div>
    </div>
  );
}
