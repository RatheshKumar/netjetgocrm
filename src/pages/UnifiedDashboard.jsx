// src/pages/UnifiedDashboard.jsx
import React from 'react';
import theme from '../config/theme';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';

const T = theme;

export default function UnifiedDashboard() {
  const { user } = useAuth();
  
  // Mock data for demo - in real app would fetch from each module service
  const stats = {
    crm: [ { label: 'Active Leads', val: '42', trend: '+12%' }, { label: 'Open Tickets', val: '8', trend: '-2' } ],
    hrm: [ { label: 'Employees In', val: '18/22', trend: '82%' }, { label: 'Leave Requests', val: '3', trend: 'Pending' } ]
  };

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${user?.name}`} 
        subtitle={`System Overview for ${user?.role} Role`} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 30 }}>
        {/* CRM Stats */}
        {(user?.role === 'Admin' || user?.role === 'CEO / Founder' || ['Sales', 'Sales Rep', 'Sales Manager', 'Business Developer'].includes(user?.role)) && 
          stats.crm.map(s => <StatCard key={s.label} {...s} color={T.brand.pink} />)}
        
        {/* HRM Stats */}
        {(user?.role === 'Admin' || user?.role === 'CEO / Founder' || user?.role === 'HR') && 
          stats.hrm.map(s => <StatCard key={s.label} {...s} color={T.status.success} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>🚀 System Activity</h3>
          <div style={{ color: T.text.muted, fontSize: 13 }}>
            <p>• Lead "Acme Corp" moved to Negotiating (CRM)</p>
            <p>• New Employee "Jane Smith" onboarded (HRM)</p>
            <p>• Leave request approved for "Dave Wright" (HRM)</p>
          </div>
        </div>
        <div style={{ background: '#fff', padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>📅 Upcoming Priorities</h3>
          <div style={{ color: T.text.muted, fontSize: 13 }}>
            <p>• SLA Breach Warning: Ticket #882 (Pending Response)</p>
            <p>• Recruitment drive for Sales Department starting tomorrow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
