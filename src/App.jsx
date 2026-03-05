

import React, { useState, useEffect } from 'react';

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Layout ────────────────────────────────────────────────────────────────────
import Sidebar from './components/layout/Sidebar';
import Topbar  from './components/layout/Topbar';

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage  from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// ── CRM pages ─────────────────────────────────────────────────────────────────
import DashboardPage  from './pages/DashboardPage';
import ContactsPage   from './pages/ContactsPage';
import CompaniesPage  from './pages/CompaniesPage';
import LeadsPage      from './pages/LeadsPage';
import PipelinePage   from './pages/PipelinePage';
import ContractsPage  from './pages/ContractsPage';
import InvoicesPage   from './pages/InvoicesPage';
import PaymentsPage   from './pages/PaymentsPage';
import TasksPage      from './pages/TasksPage';
// ✏️  Import new pages here ↑

// ── Data hook & config ────────────────────────────────────────────────────────
import useDB       from './hooks/useDB';
import { DB_KEYS } from './config/db';
import theme       from './config/theme';

const T = theme;

// =============================================================================
// GLOBAL STYLES — injected once into <head>
// =============================================================================
const GLOBAL_CSS = `
  @import url('${theme.fonts.import}');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: ${theme.fonts.body}; background: ${theme.surface.page}; color: ${theme.text.primary}; -webkit-font-smoothing: antialiased; }
  input, select, textarea, button { font-family: inherit; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.border.medium}; border-radius: 10px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes modalIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;

// =============================================================================
// CRM SHELL — shown when user is logged in
// =============================================================================
function CRMShell() {
  const [activePage, setActivePage] = useState('dashboard');

  // ── Load all data with the useDB hook ──────────────────────────────────────
  const contacts  = useDB(DB_KEYS.CONTACTS);
  const companies = useDB(DB_KEYS.COMPANIES);
  const leads     = useDB(DB_KEYS.LEADS);
  const contracts = useDB(DB_KEYS.CONTRACTS);
  const invoices  = useDB(DB_KEYS.INVOICES);
  const payments  = useDB(DB_KEYS.PAYMENTS);
  const tasks     = useDB(DB_KEYS.TASKS);
  const pipelines = useDB(DB_KEYS.PIPELINES);
  // ✏️  Add new data hooks here ↑

  // ── Sidebar badge counts ───────────────────────────────────────────────────
  const counts = {
    contacts:  contacts.items.length,
    companies: companies.items.length,
    leads:     leads.items.filter(l => ['Pending','In Progress'].includes(l.status)).length,
    pipeline:  pipelines.items.length,
    contracts: contracts.items.length,
    invoices:  invoices.items.length,
    payments:  payments.items.length,
    tasks:     tasks.items.filter(t => t.status !== 'Completed').length,
  };

  // ── Page map — add new pages here ─────────────────────────────────────────
  // Each key matches the `id` in src/config/navigation.js
  const pages = {
    dashboard: (
      <DashboardPage
        contacts={contacts.items}
        companies={companies.items}
        leads={leads.items}
        invoices={invoices.items}
        payments={payments.items}
        tasks={tasks.items}
      />
    ),
    contacts: (
      <ContactsPage
        companies={companies.items}
      />
    ),
    companies: (
      <CompaniesPage />
    ),
    leads: (
      <LeadsPage
        companies={companies.items}
      />
    ),
    pipeline: (
      <PipelinePage />
    ),
    contracts: (
      <ContractsPage
        companies={companies.items}
        contacts={contacts.items}
      />
    ),
    invoices: (
      <InvoicesPage
        companies={companies.items}
        contacts={contacts.items}
      />
    ),
    payments: (
      <PaymentsPage
        invoices={invoices.items}
        companies={companies.items}
        contacts={contacts.items}
      />
    ),
    tasks: (
      <TasksPage
        contacts={contacts.items}
      />
    ),
    // ✏️  Add new pages here:
    // mypage: <MyNewPage />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left sidebar */}
      <Sidebar
        activePage={activePage}
        setPage={setActivePage}
        counts={counts}
      />

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: T.surface.page }}>
          {pages[activePage] || <div style={{ color: T.text.muted, padding: 40 }}>Page not found.</div>}
        </main>
      </div>
    </div>
  );
}

// =============================================================================
// AUTH GATE — decides whether to show login/signup or the CRM
// =============================================================================
function AuthGate() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // Loading spinner while session is being restored
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${T.border.light}`, borderTopColor: T.brand.indigo, animation: 'spin 0.7s linear infinite' }} />
        <span style={{ color: T.text.muted, fontSize: 13 }}>Loading…</span>
      </div>
    );
  }

  // Not logged in — show auth pages
  if (!user) {
    return authView === 'login'
      ? <LoginPage  onGoSignup={() => setAuthView('signup')} />
      : <SignupPage onGoLogin={()  => setAuthView('login')}  />;
  }

  // Logged in — show CRM
  return <CRMShell />;
}

// =============================================================================
// ROOT EXPORT
// =============================================================================
export default function App() {
  // Inject global CSS once on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
