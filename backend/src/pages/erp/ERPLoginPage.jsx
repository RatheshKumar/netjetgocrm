// =============================================================================
// src/pages/erp/ERPLoginPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { useAuth } from '../../context/AuthContext';

const T = theme;

function ERPLoginPage({ onGoSignup }) {
  const { erpLogin } = useAuth();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const res = await erpLogin(form.email, form.password);
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.fonts.body }}>

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div style={{ width: '42%', background: T.surface.sidebar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>

        {/* Decorative glow blobs */}
        <div style={{ position: 'absolute', top: 60, right: 50, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,25,122,0.45),transparent)', filter: 'blur(28px)' }} />
        <div style={{ position: 'absolute', bottom: 90, left: 40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.38),transparent)', filter: 'blur(32px)' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* ERP Brand badge */}
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24 }}>
            🏪 Retail ERP System
          </div>

          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Run your retail shop<br />with confidence
          </h2>
          <p style={{ color: T.text.onBrandMuted, fontSize: 13, textAlign: 'center', lineHeight: 1.75, maxWidth: 280 }}>
            Manage inventory, process sales, handle employees, and track every rupee — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, justifyContent: 'center' }}>
            {['📦 Inventory', '🧾 Point of Sale', '👥 Employees', '💰 Payroll', '📊 Analytics', '🛒 Purchases'].map(f => (
              <span key={f} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>{f}</span>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 40 }}>
            {[['500+', 'Retailers'], ['99.9%', 'Uptime'], ['24/7', 'Support']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{val}</div>
                <div style={{ fontSize: 11, color: T.text.onBrandMuted, marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface.page, padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo & title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, borderRadius: T.radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏪</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text.primary, lineHeight: 1.2 }}>NetJetGo ERP</div>
              <div style={{ fontSize: 11, color: T.text.muted }}>Retail Management System</div>
            </div>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ color: T.text.muted, fontSize: 13, marginBottom: 28 }}>Sign in to your ERP account</p>

          <form onSubmit={handle}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@yourshop.com"
                style={{ width: '100%', padding: '11px 13px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, color: T.text.primary, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: '11px 40px 11px 13px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, color: T.text.primary, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.text.muted, fontSize: 14 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: T.radius.md, padding: '9px 13px', marginBottom: 14, color: T.status.danger, fontSize: 13, fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px 0', marginTop: 8, background: loading ? T.text.muted : `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(61,59,175,0.3)', fontFamily: 'inherit' }}
            >
              {loading ? 'Signing in…' : 'Sign In to ERP →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: T.text.muted }}>
            New to NetJetGo ERP?{' '}
            <button onClick={onGoSignup} style={{ background: 'none', border: 'none', color: T.brand.indigo, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Create account →
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.border.light}` }}>
            <a href="/" style={{ color: T.text.muted, textDecoration: 'none', fontSize: 12 }}>
              ← Back to CRM Portal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ERPLoginPage;
