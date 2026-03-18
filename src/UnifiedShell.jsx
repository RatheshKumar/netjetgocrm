// src/UnifiedShell.jsx
import React, { useState, useEffect } from 'react';
import theme from './config/theme';
import { useAuth } from './context/AuthContext';
import UnifiedSidebar from './components/UnifiedSidebar';
import ERPTopbar from './components/erp/ERPTopbar';
import UnifiedDashboard from './pages/UnifiedDashboard';
import FloatingChat from './components/collaboration/FloatingChat';

import ERPTicketsPage from './pages/erp/ERPTicketsPage';
import StaffPage from './pages/hrm/StaffPage';
import LeadsPage from './pages/crm/LeadsPage';

// Restored & New Pages
import ContactsPage from './pages/ContactsPage';
import CompaniesPage from './pages/CompaniesPage';
import PipelinePage from './pages/PipelinePage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import TasksPage from './pages/TasksPage';
import ProjectsPage from './pages/ProjectsPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';

// HRM & CRM
import RecruitmentPage from './pages/hrm/RecruitmentPage';
import MarketingPage from './pages/crm/MarketingPage';

// Collaboration Pages
import TaskAssignmentPage from './pages/collaboration/TaskAssignmentPage';
import MeetingPortalPage from './pages/collaboration/MeetingPortalPage';
import DiscussionRoomPage from './pages/collaboration/DiscussionRoomPage';
import KnowledgeBasePage from './pages/collaboration/KnowledgeBasePage';
import AnnouncementsPage from './pages/collaboration/AnnouncementsPage';

import ReportsPage from './pages/ReportsPage';

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
          Welcome to NetJet OS! Your account has been created successfully. A CEO or Administrator needs to assign your role before you can access the business modules.
        </p>
        <button 
          onClick={logout}
          style={{ padding: '12px 32px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer' }}
        >
          Logout Session
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch(activePage) {
      case 'dashboard':     return <UnifiedDashboard />;
      case 'users':         return <UserManagementPage />;
      
      // Collaboration
      case 'collab-tasks':    return <TaskAssignmentPage />;
      case 'collab-meetings': return <MeetingPortalPage />;
      case 'collab-rooms':    return <DiscussionRoomPage />;
      case 'collab-wiki':     return <KnowledgeBasePage />;
      case 'collab-news':     return <AnnouncementsPage />;
      
      // CRM
      case 'crm-leads':     return <LeadsPage />;
      case 'crm-contacts':  return <ContactsPage />;
      case 'crm-marketing': return <MarketingPage />;
      case 'crm-companies': return <CompaniesPage />;
      case 'crm-pipeline':  return <PipelinePage />;
      case 'crm-tickets':   return <ERPTicketsPage />;
      case 'crm-invoices':  return <InvoicesPage />;
      case 'crm-payments':  return <PaymentsPage />;
      case 'crm-tasks':     return <TasksPage />;
      case 'crm-projects':  return <ProjectsPage />;
      
      // HRM
      case 'hrm-staff':       return <StaffPage />;
      case 'hrm-recruitment': return <RecruitmentPage />;
      case 'hrm-leaves':      return <div style={{ padding: 40, background: '#fff', borderRadius: 12, border: '1px solid #eee' }}><h3>Leave Management</h3><p>Attendance and leave requests module.</p></div>;
      
      // Generic
      case 'settings':      return <SettingsPage />;
      
      default: return <div style={{ padding: 40, color: T.text.muted }}>Module component for "{activePage}" is under migration to Unified OS...</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.surface.page }}>
      <UnifiedSidebar activePage={activePage} setPage={setActivePage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ERPTopbar activePage={activePage} />
        <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {renderContent()}
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}
