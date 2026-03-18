// =============================================================================
// src/pages/SignupPage.jsx
// =============================================================================
import React, { useState } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';
import logoLight from '../assets/logo-light.png';
import logoDark  from '../assets/logo-dark.png';

const T = theme;

function SignupPage({ onGoLogin }) {
  const { signup } = useAuth();
  const [step,     setStep]     = useState(1); // 2-step form
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirm: '', role: 'Sales Rep' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const setField = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  // Step 1 validation
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Step 2 validation
  const validateStep2 = () => {
    const e = {};
    if (form.password.length < 6)     e.password = 'Minimum 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = e => { e.preventDefault(); if (validateStep1()) setStep(2); };

  const handleSignup = async e => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    const res = await signup({ name: form.name, email: form.email, password: form.password, role: 'Pending' });
    if (!res.ok) { 
      setErrors({ confirm: res.error }); 
      setLoading(false); 
    } else {
      onGoLogin(); // Success redirect
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: T.fonts.body }}>

      {/* ── Left brand panel ──────────────────────────────────────────────── */}
      <div style={{ width: '38%', background: T.surface.sidebar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 60, right: 40, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,25,122,0.5),transparent)', filter: 'blur(22px)' }} />
        <div style={{ position: 'absolute', bottom: 80, left: 30, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,166,35,0.4),transparent)', filter: 'blur(26px)' }} />

        <img src={logoDark} alt="NetJetGo" style={{ width: 180, height: 'auto', marginBottom: 28, position: 'relative', zIndex: 1 }} />
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 10, letterSpacing: '-0.02em', position: 'relative', zIndex: 1 }}>
          NetJet Unified Business OS
        </h2>
        <p style={{ color: T.text.onBrandMuted, fontSize: 12, textAlign: 'center', lineHeight: 1.7, maxWidth: 240, position: 'relative', zIndex: 1 }}>
          The complete platform for your business operations.
        </p>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 20, marginTop: 32, position: 'relative', zIndex: 1 }}>
          {[{ n: 1, label: 'Your Info' }, { n: 2, label: 'Password' }].map(({ n, label }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: step >= n ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', color: step >= n ? T.brand.indigo : T.text.onBrandMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all 0.25s' }}>
                {n}
              </div>
              <span style={{ color: step >= n ? '#fff' : T.text.onBrandMuted, fontSize: 12, fontWeight: step >= n ? 600 : 400 }}>{label}</span>
              {n < 2 && <span style={{ color: T.text.onBrandMuted, fontSize: 12 }}>→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface.page, padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <img src={logoLight} alt="NetJetGo" style={{ height: 28, width: 'auto', marginBottom: 32, display: 'block' }} />

          <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text.primary, marginBottom: 5, letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Create your account' : 'Set your password'}
          </h1>
          <p style={{ color: T.text.muted, fontSize: 13, marginBottom: 22 }}>
            {step === 1 ? 'Tell us a bit about yourself' : 'Choose a secure password'}
          </p>

          {/* Progress bar */}
          <div style={{ height: 4, background: T.border.light, borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: `linear-gradient(90deg, ${T.brand.pink}, ${T.brand.orange})`, borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>

          {/* ── Step 1: Info ─────────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <Field label="Full Name"   name="name"  type="text"  value={form.name}  onChange={setField('name')}  placeholder="John Smith"          error={errors.name} />
              <Field label="Work Email"  name="email" type="email" value={form.email} onChange={setField('email')} placeholder="you@netjetgo.com"   error={errors.email} />
              <button type="submit" style={submitBtn(false)}>Continue →</button>
            </form>
          )}

          {/* ── Step 2: Password ─────────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleSignup}>
              <PasswordField label="Password" value={form.password} onChange={setField('password')} show={showPass} onToggle={() => setShowPass(p => !p)} placeholder="Min. 6 characters" error={errors.password} />
              <PasswordField label="Confirm Password" value={form.confirm} onChange={setField('confirm')} show={showPass} onToggle={() => setShowPass(p => !p)} placeholder="Re-enter password" error={errors.confirm} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setStep(1)} style={{ ...submitBtn(false), background: '#fff', color: T.text.primary, border: `1.5px solid ${T.border.light}`, flex: 1 }}>
                  ← Back
                </button>
                <button type="submit" disabled={loading} style={{ ...submitBtn(loading), flex: 2 }}>
                  {loading ? 'Creating account…' : 'Create Account 🚀'}
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
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
const T2 = theme;

const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: T2.text.muted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' };
const submitBtn = (disabled) => ({ width: '100%', padding: '12px 0', background: disabled ? T2.text.muted : `linear-gradient(135deg,${T2.brand.indigo},${T2.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T2.radius.md, fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(61,59,175,0.28)' });

function Field({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input {...props} style={{ width: '100%', padding: '11px 13px', border: `1.5px solid ${error ? T2.status.danger : T2.border.light}`, borderRadius: T2.radius.md, fontSize: 13, color: T2.text.primary, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
      {error && <p style={{ color: T2.status.danger, fontSize: 11, marginTop: 3 }}>⚠ {error}</p>}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: '100%', padding: '11px 40px 11px 13px', border: `1.5px solid ${error ? T2.status.danger : T2.border.light}`, borderRadius: T2.radius.md, fontSize: 13, color: T2.text.primary, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        <button type="button" onClick={onToggle} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T2.text.muted, fontSize: 14 }}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {error && <p style={{ color: T2.status.danger, fontSize: 11, marginTop: 3 }}>⚠ {error}</p>}
    </div>
  );
}

export default SignupPage;
