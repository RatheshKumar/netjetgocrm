// =============================================================================
// src/pages/LoginPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';
import logoLight from '../assets/logo-light.png';
import logoDark  from '../assets/logo-dark.png';

const T = theme;

function LoginPage({ onGoSignup }) {
  const { login } = useAuth();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    const res = await login(form.email, form.password, 'user');
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.fonts.body }}>

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div style={{ width: '42%', background: T.surface.sidebar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>

        {/* Decorative glow blobs */}
        <div style={{ position: 'absolute', top: 60, right: 50, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,25,122,0.45),transparent)', filter: 'blur(28px)' }} />
        <div style={{ position: 'absolute', bottom: 90, left: 40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.38),transparent)', filter: 'blur(32px)' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 350, height: 350, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

        {/* Content */}
        <img src={logoDark} alt="NetJetGo" style={{ width: 200, height: 'auto', marginBottom: 32, position: 'relative', zIndex: 1 }} />
        <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Your Sales CRM,<br />Supercharged
        </h2>
        <p style={{ color: T.text.onBrandMuted, fontSize: 13, textAlign: 'center', lineHeight: 1.75, maxWidth: 280, position: 'relative', zIndex: 1 }}>
          Manage contacts, leads, invoices and pipelines — all in one powerful platform.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {['📈 Lead Tracking', '🏢 Company CRM', '🧾 Invoicing', '✅ Tasks'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface.page, padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <img src={logoLight} alt="NetJetGo" style={{ height: 30, width: 'auto', marginBottom: 36, display: 'block' }} />

          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, marginBottom: 6, letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ color: T.text.muted, fontSize: 13, marginBottom: 28 }}>Sign in to your NetJetGo account</p>

          <form onSubmit={handle}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@company.com"
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
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: T.text.muted }}>
            Don't have an account?{' '}
            <button onClick={onGoSignup} style={{ background: 'none', border: 'none', color: T.brand.indigo, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Create one →
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            <a href="/admin" style={{ color: T.text.muted, textDecoration: 'none' }}>
              Administrator Login →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
