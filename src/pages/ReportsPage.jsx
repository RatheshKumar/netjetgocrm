import React, { useState, useEffect, useCallback } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/stats`, { headers: authHeader() });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Role Permissions Logic
  const isAdmin      = ['Admin', 'CEO / Founder'].includes(user?.role);
  const isCRM        = isAdmin || ['Sales Representative', 'Marketing Specialist', 'Accountant'].includes(user?.role);
  const isHRM        = isAdmin || ['HR Manager', 'Accountant'].includes(user?.role);
  const isSupport    = isAdmin || ['Support Agent', 'Project Manager'].includes(user?.role);
  const isProject    = isAdmin || ['Project Manager'].includes(user?.role);

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading Reports...</div>;
  if (!data) return <div style={{padding:40,color:T.status.danger}}>Failed to load system analytics.</div>;

  const COLORS = [T.brand.indigo, T.brand.pink, T.brand.emerald, T.brand.orange, T.brand.purple];

  return (
    <div>
      <PageHeader title="Business Intelligence" subtitle="Departmental analytics and data-driven insights.">
        <div style={{ display: 'flex', gap: 10 }}>
           <span style={{ fontSize: 13, background: T.brand.indigoLight, color: T.brand.indigo, padding: '4px 12px', borderRadius: 20, fontWeight: 700 }}>
             Role: {user?.role}
           </span>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginTop: 24 }}>
        
        {/* SECTION: CRM Analytics */}
        {isCRM && (
          <div style={{ background: T.surface.card, padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 CRM & Lead Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.leadSources}>
                <XAxis dataKey="name" stroke={T.text.muted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={T.text.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{background: '#fff', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                <Bar dataKey="value" fill={T.brand.indigo} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, fontSize: 13, color: T.text.subtle, textAlign: 'center' }}>Total Pipeline Value: <strong>${Math.floor(data.leads.totalValue || 0).toLocaleString()}</strong></div>
          </div>
        )}

        {/* SECTION: HRM Analytics */}
        {isHRM && (
          <div style={{ background: T.surface.card, padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 8 }}>
              👤 Human Resources Overview
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.deptHeadcount} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" nameKey="name" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {data.deptHeadcount.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background: '#fff', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, fontSize: 13, color: T.text.subtle, textAlign: 'center' }}>Total Headcount: <strong>{data.employees.total}</strong></div>
          </div>
        )}

        {/* SECTION: Support & Operations */}
        {isSupport && (
          <div style={{ background: T.surface.card, padding: 24, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, color: T.text.primary, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎫 Support Ticket Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.ticketStatuses} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} stroke={T.text.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{background: '#fff', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
                <Bar dataKey="value" fill={T.brand.orange} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 16, fontSize: 13, color: T.text.subtle, textAlign: 'center' }}>Open Tickets: <strong>{data.tickets.open}</strong></div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReportsPage;
