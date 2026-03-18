// src/components/UnifiedSidebar.jsx
import React from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';

const T = theme;

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'OS Dashboard', icon: '🏠' },
  { id: 'users',       label: 'User Management', icon: '👤', roles: ['Admin', 'CEO / Founder'] },
  
  // CRM Section
  { id: 'crm-leads',    label: 'Leads',        icon: '🎯', module: 'CRM' },
  { id: 'crm-contacts', label: 'Contacts',     icon: '👥', module: 'CRM' },
  { id: 'crm-companies',label: 'Companies',    icon: '🏢', module: 'CRM' },
  { id: 'crm-marketing',label: 'Marketing',    icon: '📣', module: 'CRM' },
  { id: 'crm-pipeline', label: 'Pipeline',     icon: '📈', module: 'CRM' },
  { id: 'crm-projects', label: 'Projects',     icon: '🏗️', module: 'CRM' },
  { id: 'crm-tasks',    label: 'Operations',   icon: '⚙️', module: 'CRM' },
  { id: 'crm-tickets',  label: 'Tickets',      icon: '🎫', module: 'CRM' },
  { id: 'crm-invoices', label: 'Invoices',     icon: '🧾' },
  { id: 'crm-payments', label: 'Payments',     icon: '💰' },
  
  // HRM Section
  { id: 'hrm-staff',    label: 'Employees',    icon: '👥' },
  { id: 'hrm-recruitment',label: 'Recruitment',icon: '🎯' },
  { id: 'hrm-leaves',   label: 'Leaves',       icon: '🌴' },
  
  // Collaboration Section
  { id: 'collab-tasks',    label: 'Task Board',   icon: '📋' },
  { id: 'collab-meetings', label: 'Meetings',     icon: '📹' },
  { id: 'collab-rooms',    label: 'Discussions',  icon: '💬' },
  { id: 'collab-wiki',     label: 'Knowledge',    icon: '📚' },
  { id: 'collab-news',     label: 'Announcements',icon: '📢' },
  
  { id: 'settings',     label: 'OS Settings',  icon: '⚙️' },
];

export default function UnifiedSidebar({ activePage, setPage }) {
  const { user, logout } = useAuth();
  
  const categories = [
    { title: 'MENU', items: ['dashboard', 'users'] },
    { title: 'CUSTOMER RELATIONSHIP', items: ['crm-leads', 'crm-contacts', 'crm-companies', 'crm-marketing', 'crm-pipeline', 'crm-projects', 'crm-tasks', 'crm-tickets', 'crm-invoices', 'crm-payments'] },
    { title: 'HUMAN RESOURCES', items: ['hrm-staff', 'hrm-recruitment', 'hrm-leaves'] },
    { title: 'COLLABORATION', items: ['collab-tasks', 'collab-meetings', 'collab-rooms', 'collab-wiki', 'collab-news'] },
    { title: 'SYSTEM', items: ['settings'] },
  ];

  const filtered = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.role));

  return (
    <div style={{
      width: 280, background: T.surface.sidebar, borderRight: `1px solid ${T.border.light}`,
      display: 'flex', flexDirection: 'column', height: '100%', padding: '0', flexShrink: 0,
    }}>
      <div style={{ padding: '32px 24px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>NetJet OS</h1>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: 800 }}>Company CRM & HRM Suite</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {categories.map(cat => {
          const catItems = filtered.filter(fi => cat.items.includes(fi.id));
          if (catItems.length === 0) return null;
          return (
            <div key={cat.title}>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', padding: '0 16px', marginBottom: 10 }}>{cat.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {catItems.map(item => {
                  const isActive = activePage === item.id;
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setPage(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
                        border: 'none', borderRadius: T.radius.md, cursor: 'pointer', transition: '0.2s',
                        background: isActive ? '#fff' : 'transparent',
                        color: isActive ? T.brand.indigo : 'rgba(255,255,255,0.8)',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{item.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: isActive ? 800 : 500 }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
           <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
             {user?.name?.[0] || 'U'}
           </div>
           <div>
             <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user?.name || 'User'}</div>
             <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{user?.role}</div>
           </div>
        </div>
        <button 
          onClick={logout}
          style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: T.radius.md, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
        >
          Logout Session
        </button>
      </div>
    </div>
  );
}
