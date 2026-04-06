// src/components/UnifiedSidebar.jsx
import React, { useState } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';

const T = theme;

// SVG Icons
const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  leads:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/><path d="M15 13l3 3-3 3"/></svg>,
  contacts:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  companies: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  contracts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  products:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  marketing: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  pipeline:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  projects:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  tasks:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  tickets:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>,
  invoices:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  payments:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  staff:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  recruit:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
  leaves:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  attendance:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  dept:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="4" rx="1"/><path d="M6 7v4"/><path d="M12 7v4"/><path d="M18 7v4"/><rect x="1" y="11" width="6" height="4" rx="1"/><rect x="9" y="11" width="6" height="4" rx="1"/><rect x="17" y="11" width="6" height="4" rx="1"/></svg>,
  payroll:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  announce:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.01c0-6.55-4.49-6-10-6C6.49 2.01 2 1.46 2 8.01v2c0 6.55 4.49 6 10 6 5.51 0 10 .55 10-6v-2z"/><path d="M6 8v4"/><path d="M10 9v2"/><path d="M14 8v4"/><path d="M18 9v2"/></svg>,
  meetings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  discuss:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  knowledge: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  settings:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV = [
  { id: 'dashboard',    label: 'Dashboard',       icon: Icons.dashboard },
  { id: 'users',        label: 'User Management', icon: Icons.users, roles: ['Admin', 'CEO / Founder'] },

  // CRM
  { id: 'crm-leads',    label: 'Leads',           icon: Icons.leads,    roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'], cat: 'CRM' },
  { id: 'crm-contacts', label: 'Contacts',        icon: Icons.contacts, roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist', 'Support Agent'], cat: 'CRM' },
  { id: 'crm-companies',label: 'Companies',       icon: Icons.companies,roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist', 'Support Agent'], cat: 'CRM' },
  { id: 'crm-contracts',label: 'Contracts',       icon: Icons.contracts,roles: ['Admin', 'CEO / Founder', 'Accountant', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-products', label: 'Inventory',       icon: Icons.products, roles: ['Admin', 'CEO / Founder', 'Accountant', 'Project Manager', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-marketing',label: 'Advertising',     icon: Icons.marketing,roles: ['Admin', 'CEO / Founder', 'Marketing Specialist'], cat: 'CRM' },
  { id: 'crm-pipeline', label: 'Pipeline',        icon: Icons.pipeline, roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'], cat: 'CRM' },
  { id: 'crm-projects', label: 'Workspaces',      icon: Icons.projects, roles: ['Admin', 'CEO / Founder', 'Project Manager', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-tasks',    label: 'Operations',      icon: Icons.tasks,    roles: ['Admin', 'CEO / Founder', 'Project Manager', 'Support Agent', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-tickets',  label: 'Service Tickets', icon: Icons.tickets,  roles: ['Admin', 'CEO / Founder', 'Support Agent', 'Project Manager', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-invoices', label: 'Invoices',        icon: Icons.invoices, roles: ['Admin', 'CEO / Founder', 'Accountant', 'Sales Representative'], cat: 'CRM' },
  { id: 'crm-payments', label: 'Financials',      icon: Icons.payments, roles: ['Admin', 'CEO / Founder', 'Accountant'], cat: 'CRM' },

  // HRM
  { id: 'hrm-staff',      label: 'Employees',     icon: Icons.staff,    roles: ['Admin', 'CEO / Founder', 'HR Manager'], cat: 'HRM' },
  { id: 'hrm-recruitment',label: 'Recruitment',   icon: Icons.recruit,  roles: ['Admin', 'CEO / Founder', 'HR Manager'], cat: 'HRM' },
  { id: 'hrm-leaves',     label: 'Leave Mgmt',    icon: Icons.leaves,   roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'HRM' },
  { id: 'hrm-attendance', label: 'Attendance',    icon: Icons.attendance,roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'HRM' },
  { id: 'hrm-departments',label: 'Departments',   icon: Icons.dept,     roles: ['Admin', 'CEO / Founder', 'HR Manager'], cat: 'HRM' },
  { id: 'hrm-payroll',    label: 'Payroll',       icon: Icons.payroll,  roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Accountant'], cat: 'HRM' },

  // Collaboration
  { id: 'collab-news',     label: 'Announcements',icon: Icons.announce, roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'COLLAB' },
  { id: 'collab-meetings', label: 'Meetings',     icon: Icons.meetings, roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'COLLAB' },
  { id: 'collab-rooms',    label: 'Discussions',  icon: Icons.discuss,  roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'COLLAB' },
  { id: 'collab-wiki',     label: 'Knowledge Base',icon: Icons.knowledge,roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Regular Employee', 'Project Manager', 'Support Agent', 'Sales Representative', 'Marketing Specialist', 'Accountant'], cat: 'COLLAB' },

  { id: 'settings', label: 'Settings', icon: Icons.settings },
];

const SECTIONS = [
  { title: 'MENU',                items: ['dashboard', 'users'] },
  { title: 'CUSTOMER RELATIONS',  items: ['crm-leads','crm-contacts','crm-companies','crm-contracts','crm-products','crm-marketing','crm-pipeline','crm-projects','crm-tasks','crm-tickets','crm-invoices','crm-payments'] },
  { title: 'HUMAN RESOURCES',     items: ['hrm-staff','hrm-recruitment','hrm-leaves','hrm-attendance','hrm-departments','hrm-payroll'] },
  { title: 'COLLABORATION',        items: ['collab-news','collab-meetings','collab-rooms','collab-wiki'] },
  { title: 'SYSTEM',              items: ['settings'] },
];

export default function UnifiedSidebar({ activePage, setPage }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState({});

  const toggle = (title) => setCollapsed(p => ({ ...p, [title]: !p[title] }));
  const filtered = NAV.filter(item => !item.roles || item.roles.includes(user?.role));

  const getSectionTitle = (orig) => {
    if (orig === 'CUSTOMER RELATIONS') {
      if (user?.role === 'Sales Representative') return 'SALES HUB';
      if (user?.role === 'Support Agent') return 'SERVICE DESK';
      if (user?.role === 'Marketing Specialist') return 'GROWTH CENTER';
      return 'CRM ENGINES';
    }
    if (orig === 'HUMAN RESOURCES') {
      if (['Admin', 'CEO / Founder', 'HR Manager'].includes(user?.role)) return 'PEOPLE & OPS';
      return 'MY WORKPLACE';
    }
    return orig;
  };

  return (
    <div style={{ width: 256, background: T.surface.sidebar, borderRight: `1px solid rgba(255,255,255,0.08)`, display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚀</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>NetJet OS</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>CRM & HRM Suite</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}
        className="sidebar-scroll">
        {SECTIONS.map(sec => {
          const secItems = filtered.filter(f => sec.items.includes(f.id));
          if (secItems.length === 0) return null;
          const isCollapsed = collapsed[sec.title];
          return (
            <div key={sec.title} style={{ marginBottom: 4 }}>
              <button onClick={() => toggle(sec.title)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1 }}>{getSectionTitle(sec.title)}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: '0.2s' }}>▾</span>
              </button>
              {!isCollapsed && secItems.map(item => {
                const isActive = activePage === item.id;
                return (
                  <button key={item.id} onClick={() => setPage(item.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '10px 12px',
                    border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    background: isActive ? 'rgba(255,255,255,1)' : 'transparent',
                    color: isActive ? T.brand.indigo : 'rgba(255,255,255,0.75)',
                    textAlign: 'left', marginBottom: 2,
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ opacity: isActive ? 1 : 0.8, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, letterSpacing: '-0.1px' }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User footer */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {Icons.logout} Logout
        </button>
      </div>
    </div>
  );
}
