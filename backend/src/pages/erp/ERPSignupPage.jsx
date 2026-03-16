// =============================================================================
// src/pages/erp/ERPSignupPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS } from '../../config/db';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle = (err) => ({ width: '100%', padding: '11px 13px', border: `1.5px solid ${err ? T.status.danger : T.border.light}`, borderRadius: T.radius.md, fontSize: 13, color: T.text.primary, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' });
const selectStyle = { width: '100%', padding: '11px 13px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, color: T.text.primary, background: '#fff', outline: 'none', appearance: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const submitBtnStyle = (disabled) => ({ width: '100%', padding: '12px 0', background: disabled ? T.text.muted : `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(61,59,175,0.28)' });

function Field({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={inputStyle(error)} />
      {error && <p style={{ color: T.status.danger, fontSize: 11, marginTop: 3 }}>⚠ {error}</p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
          style={{ ...inputStyle(error), padding: '11px 40px 11px 13px' }} />
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.text.muted, fontSize: 14 }}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {error && <p style={{ color: T.status.danger, fontSize: 11, marginTop: 3 }}>⚠ {error}</p>}
    </div>
  );
}

function ERPSignupPage({ onGoLogin }) {
  const { erpSignup } = useAuth();
  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState({ name: '', email: '', shopName: '', role: 'Shop Owner', password: '', confirm: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const setField = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required.';
    if (!form.shopName.trim()) e.shopName = 'Shop name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.password.length < 6)       e.password = 'Minimum 6 characters.';
    if (form.password !== form.confirm)  e.confirm  = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = e => { e.preventDefault(); if (validateStep1()) setStep(2); };

  const handleSignup = async e => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const res = await erpSignup({ name: form.name, email: form.email, password: form.password, role: form.role, shopName: form.shopName });
    if (!res.ok) { setErrors({ confirm: res.error }); setLoading(false); }
  };

  const steps = [{ n: 1, label: 'Shop Info' }, { n: 2, label: 'Password' }];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.fonts.body }}>

      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div style={{ width: '38%', background: T.surface.sidebar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, right: 40, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,25,122,0.5),transparent)', filter: 'blur(22px)' }} />
        <div style={{ position: 'absolute', bottom: 80, left: 30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.4),transparent)', filter: 'blur(26px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.02em' }}>
            Set up your<br />retail store
          </h2>
          <p style={{ color: T.text.onBrandMuted, fontSize: 12, lineHeight: 1.7, maxWidth: 240 }}>
            Join hundreds of retailers using NetJetGo ERP to run a smarter, faster business.
          </p>

          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 20, marginTop: 32, justifyContent: 'center' }}>
            {steps.map(({ n, label }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: step >= n ? T.brand.indigo : T.text.onBrandMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.25s' }}>{n}</div>
                <span style={{ color: step >= n ? '#fff' : T.text.onBrandMuted, fontSize: 12, fontWeight: step >= n ? 600 : 400 }}>{label}</span>
                {n < 2 && <span style={{ color: T.text.onBrandMuted, fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>

          {/* What you get */}
          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 220, margin: '36px auto 0' }}>
            {['📦 Inventory management', '🧾 Point of Sale terminal', '👥 Employee & payroll tools', '📊 Business analytics'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', borderRadius: T.radius.md, padding: '7px 12px' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface.page, padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, borderRadius: T.radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏪</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text.primary }}>NetJetGo ERP</div>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text.primary, marginBottom: 5, letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Create your account' : 'Set your password'}
          </h1>
          <p style={{ color: T.text.muted, fontSize: 13, marginBottom: 22 }}>
            {step === 1 ? 'Tell us about your shop' : 'Choose a secure password'}
          </p>

          {/* Progress bar */}
          <div style={{ height: 4, background: T.border.light, borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: `linear-gradient(90deg, ${T.brand.pink}, ${T.brand.orange})`, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <Field label="Full Name"  type="text"  value={form.name}     onChange={setField('name')}     placeholder="Your full name"       error={errors.name} />
              <Field label="Shop Name"  type="text"  value={form.shopName} onChange={setField('shopName')} placeholder="e.g. Raj General Store" error={errors.shopName} />
              <Field label="Work Email" type="email" value={form.email}    onChange={setField('email')}    placeholder="you@yourshop.com"      error={errors.email} />
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Your Role</label>
                <select value={form.role} onChange={setField('role')} style={selectStyle}>
                  {OPTIONS.erpRoles.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" style={submitBtnStyle(false)}>Continue →</button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSignup}>
              <PasswordField label="Password" value={form.password} onChange={setField('password')} show={showPass} onToggle={() => setShowPass(p => !p)} placeholder="Min. 6 characters" error={errors.password} />
              <PasswordField label="Confirm Password" value={form.confirm} onChange={setField('confirm')} show={showPass} onToggle={() => setShowPass(p => !p)} placeholder="Re-enter password" error={errors.confirm} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setStep(1)} style={{ ...submitBtnStyle(false), background: '#fff', color: T.text.primary, border: `1.5px solid ${T.border.light}`, flex: 1, boxShadow: 'none' }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={{ ...submitBtnStyle(loading), flex: 2 }}>
                  {loading ? 'Setting up…' : 'Launch my ERP 🚀'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: T.text.muted }}>
            Already have an account?{' '}
            <button onClick={onGoLogin} style={{ background: 'none', border: 'none', color: T.brand.indigo, fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              Sign in →
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/" style={{ color: T.text.muted, textDecoration: 'none', fontSize: 12 }}>← Back to CRM Portal</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ERPSignupPage;
