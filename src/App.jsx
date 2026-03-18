

import React, { useState, useEffect } from 'react';

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';

// ── Shells ──────────────────────────────────────────────────────────────────
import UnifiedShell from './UnifiedShell';

// ── Data hooks & config ────────────────────────────────────────────────────────
import theme       from './config/theme';

const T = theme;

// =============================================================================
// GLOBAL STYLES — injected once into <head>
// =============================================================================
const GLOBAL_CSS = `
  @import url('${theme.fonts.import}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: ${theme.fonts.body}; 
    background: #000; 
    color: ${theme.text.primary}; 
    -webkit-font-smoothing: antialiased; 
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    overflow: hidden;
  }
  #root {
    width: 1920px;
    height: 1080px;
    background: ${theme.surface.page};
    position: relative;
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  @media (max-width: 1920px) or (max-height: 1080px) {
    #root {
      width: 100vw;
      height: 100vh;
    }
  }
  input, select, textarea, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.border.medium}; border-radius: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes modalIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

// =============================================================================
// AUTH GATE — Unified OS Protection
// =============================================================================
function AuthGate({ authView, setAuthView }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.border.light}`, borderTopColor: T.brand.indigo, animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: T.text.muted, fontSize: 13 }}>Loading OS…</span>
      </div>
    );
  }

  if (!user) {
    return authView === 'login'
      ? <LoginPage  onGoSignup={() => setAuthView('signup')} />
      : <SignupPage onGoLogin={()  => setAuthView('login')}  />;
  }

  return <UnifiedShell />;
}

export default function App() {
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AuthGate authView={authView} setAuthView={setAuthView} />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
