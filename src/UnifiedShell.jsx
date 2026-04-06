// src/UnifiedShell.jsx
import React, { useState, useEffect } from 'react';
import theme from './config/theme';
import { useAuth } from './context/AuthContext';
import UnifiedSidebar from './components/UnifiedSidebar';
import ERPTopbar from './components/erp/ERPTopbar';
import UnifiedDashboard from './pages/UnifiedDashboard';
import FloatingChat from './components/collaboration/FloatingChat';

// CRM Pages
import LeadsPage from './pages/crm/LeadsPage';
import MarketingPage from './pages/crm/MarketingPage';
import ContactsPage from './pages/ContactsPage';
import CompaniesPage from './pages/CompaniesPage';
import PipelinePage from './pages/PipelinePage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import TicketsPage from './pages/crm/TicketsPage';
import ContractsPage from './pages/ContractsPage';
import ProductsPage from './pages/ProductsPage';

// HRM Pages
import StaffPage from './pages/hrm/StaffPage';
import RecruitmentPage from './pages/hrm/RecruitmentPage';
import LeaveManagementPage from './pages/hrm/LeaveManagementPage';
import AttendancePage from './pages/hrm/AttendancePage';
import DepartmentsPage from './pages/hrm/DepartmentsPage';
import PayrollPage from './pages/hrm/PayrollPage';

// Collaboration Pages
import AnnouncementsPage from './pages/collaboration/AnnouncementsPage';
import MeetingPortalPage from './pages/collaboration/MeetingPortalPage';
import DiscussionRoomPage from './pages/collaboration/DiscussionRoomPage';
import KnowledgeBasePage from './pages/collaboration/KnowledgeBasePage';
import TaskAssignmentPage from './pages/collaboration/TaskAssignmentPage';

// System
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';

const T = theme;

export default function UnifiedShell() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const handleNav = (e) => setActivePage(e.detail);
    window.addEventListener('nav-change', handleNav);
    return () => window.removeEventListener('nav-change', handleNav);
  }, []);

  if (user?.role === 'Pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: T.surface.page, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>⏳</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: T.text.primary, marginBottom: 12 }}>Account Pending Approval</h2>
        <p style={{ color: T.text.muted, maxWidth: 400, lineHeight: 1.6, marginBottom: 32 }}>
          Your account has been created. An Administrator needs to assign your role before you can access the platform.
        </p>
        <button onClick={logout} style={{ padding: '12px 32px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer' }}>
          Logout Session
        </button>
      </div>
    );
  }

  const AccessDenied = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: T.text.primary, marginBottom: 8 }}>Access Denied</h2>
      <p style={{ color: T.text.muted, maxWidth: 400, fontSize: 14 }}>
        You do not have the required permissions to access the <strong>{activePage}</strong> module. 
        Please contact your administrator if you believe this is an error.
      </p>
    </div>
  );

  const getPageConfig = (id) => {
    // Find item in UnifiedSidebar's NAV (or define here for central source of truth)
    // For simplicity, we'll define a mapping here or import it. 
    // Since NAV is in Sidebar, let's just define the role requirements here.
    const requirements = {
      'users':           ['Admin', 'CEO / Founder'],
      'crm-leads':       ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'],
      'crm-contacts':    ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist', 'Support Agent'],
      'crm-companies':   ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist', 'Support Agent'],
      'crm-contracts':   ['Admin', 'CEO / Founder', 'Accountant', 'Sales Representative'],
      'crm-products':    ['Admin', 'CEO / Founder', 'Accountant', 'Project Manager', 'Sales Representative'],
      'crm-marketing':   ['Admin', 'CEO / Founder', 'Marketing Specialist'],
      'crm-pipeline':    ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'],
      'crm-projects':    ['Admin', 'CEO / Founder', 'Project Manager', 'Sales Representative'],
      'crm-tasks':       ['Admin', 'CEO / Founder', 'Project Manager', 'Support Agent', 'Sales Representative'],
      'crm-tickets':     ['Admin', 'CEO / Founder', 'Support Agent', 'Project Manager', 'Sales Representative'],
      'crm-invoices':    ['Admin', 'CEO / Founder', 'Accountant', 'Sales Representative'],
      'crm-payments':    ['Admin', 'CEO / Founder', 'Accountant'],
      'hrm-staff':       ['Admin', 'CEO / Founder', 'HR Manager'],
      'hrm-recruitment': ['Admin', 'CEO / Founder', 'HR Manager'],
      'hrm-leaves':      ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'],
      'hrm-attendance':  ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'],
      'hrm-departments': ['Admin', 'CEO / Founder', 'HR Manager'],
      'hrm-payroll':     ['Admin', 'CEO / Founder', 'HR Manager', 'Accountant'],
    };
    return requirements[id];
  };

  const renderContent = () => {
    const allowedRoles = getPageConfig(activePage);
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <AccessDenied />;
    }

    switch (activePage) {
      case 'dashboard':       return <UnifiedDashboard />;
      case 'users':           return <UserManagementPage />;

      // CRM
      case 'crm-leads':       return <LeadsPage />;
      case 'crm-contacts':    return <ContactsPage companies={[]} />;
      case 'crm-companies':   return <CompaniesPage />;
      case 'crm-marketing':   return <MarketingPage />;
      case 'crm-pipeline':    return <PipelinePage />;
      case 'crm-projects':    return <ProjectsPage />;
      case 'crm-tasks':       return <TasksPage />;
      case 'crm-tickets':     return <TicketsPage />;
      case 'crm-invoices':    return <InvoicesPage />;
      case 'crm-payments':    return <PaymentsPage />;
      case 'crm-contracts':   return <ContractsPage />;
      case 'crm-products':    return <ProductsPage />;

      // HRM
      case 'hrm-staff':       return <StaffPage />;
      case 'hrm-recruitment': return <RecruitmentPage />;
      case 'hrm-leaves':      return <LeaveManagementPage />;
      case 'hrm-attendance':  return <AttendancePage />;
      case 'hrm-departments': return <DepartmentsPage />;
      case 'hrm-payroll':     return <PayrollPage />;

      // Collaboration
      case 'collab-news':     return <AnnouncementsPage />;
      case 'collab-meetings': return <MeetingPortalPage />;
      case 'collab-rooms':    return <DiscussionRoomPage />;
      case 'collab-wiki':     return <KnowledgeBasePage />;
      case 'collab-tasks':    return <TaskAssignmentPage />;

      // System
      case 'settings':        return <SettingsPage />;

      default: return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 48 }}>🚧</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Module Under Construction</div>
          <div style={{ color: T.text.muted }}>"{activePage}" is being built.</div>
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.surface.page }}>
      <UnifiedSidebar activePage={activePage} setPage={setActivePage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ERPTopbar activePage={activePage} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
          {renderContent()}
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
