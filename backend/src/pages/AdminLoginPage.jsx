import React, { useState } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';
import logoDark  from '../assets/logo-dark.png';

const T = theme;

function AdminLoginPage() {
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
    // Enforce Admin role
    const res = await login(form.email, form.password, 'admin');
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.fonts.body, background: '#111827' }}>
      
      {/* ── Left form panel (Reversed for distinction) ─────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <img src={logoDark} alt="NetJetGo" style={{ height: 30, width: 'auto', marginBottom: 36, display: 'block', filter: 'brightness(0) invert(1)' }} />

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F3F4F6', marginBottom: 6, letterSpacing: '-0.02em' }}>Admin Portal</h1>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 28 }}>Sign in to access global system settings.</p>

          <form onSubmit={handle}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@netjetgo.com"
                style={{ width: '100%', padding: '11px 13px', border: `1.5px solid #374151`, borderRadius: T.radius.md, fontSize: 13, color: '#F3F4F6', background: '#1F2937', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#9CA3AF', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your admin password"
                  style={{ width: '100%', padding: '11px 40px 11px 13px', border: `1.5px solid #374151`, borderRadius: T.radius.md, fontSize: 13, color: '#F3F4F6', background: '#1F2937', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: T.radius.md, padding: '9px 13px', marginBottom: 14, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px 0', marginTop: 8, background: loading ? '#4B5563' : `linear-gradient(135deg, ${T.brand.orange}, #E65C00)`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(245, 166, 35, 0.2)', fontFamily: 'inherit' }}
            >
              {loading ? 'Verifying Credentials…' : 'Secure Login →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12 }}>
            <a href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
              ← Return to Employee Login
            </a>
          </div>
        </div>
      </div>

      {/* ── Right brand panel (For Admin View) ─────────────────────────────── */}
      <div style={{ width: '42%', background: '#030712', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden', borderLeft: '1px solid #1F2937' }}>
        <div style={{ position: 'absolute', top: 60, right: 50, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.45),transparent)', filter: 'blur(28px)' }} />
        <div style={{ position: 'absolute', bottom: 90, left: 40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,25,122,0.38),transparent)', filter: 'blur(32px)' }} />
        
        <h2 style={{ color: '#F3F4F6', fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 12, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          Administrator <br /> Control Center
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', lineHeight: 1.75, maxWidth: 280, position: 'relative', zIndex: 1 }}>
          This portal is restricted to system administrators. Monitor application activity, billing, and global settings securely.
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 32, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {['🔒 High Security', '⚡ System Control', '⚙️ Global Settings'].map(f => (
            <span key={f} style={{ background: 'rgba(255,255,255,0.05)', color: '#D1D5DB', borderRadius: 20, padding: '5px 13px', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>{f}</span>
          ))}
        </div>
      </div>

    </div>
  );
}

export default AdminLoginPage;
