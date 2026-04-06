// src/pages/UnifiedDashboard.jsx
import React, { useState, useEffect } from 'react';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}` });

const PIE_COLORS = [T.brand.indigo, T.brand.pink, T.brand.orange, T.status.success, T.status.info];

const KPICard = ({ icon, label, value, sub, color, trend }) => (
  <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 'clamp(16px, 2vw, 24px)', display: 'flex', flexDirection: 'column', gap: 12, transition: '0.2s', cursor: 'default', flex: 1, minWidth: 220 }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${T.brand.indigoGlow}`}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ width: 48, height: 48, borderRadius: T.radius.md, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{icon}</div>
      {trend && <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: trend.startsWith('+') ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)', color: trend.startsWith('+') ? T.status.success : T.status.danger }}>{trend}</span>}
    </div>
    <div>
      <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color, lineHeight: 1.1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 'clamp(13px, 1vw, 15px)', color: T.text.muted, marginTop: 6, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: T.text.subtle, marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

const SectionHeader = ({ title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 40 }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <h2 style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', fontWeight: 800, color: T.text.primary, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</h2>
    <div style={{ flex: 1, height: 1, background: T.border.light }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, padding: 16, borderRadius: T.radius.md, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 800, color: T.text.primary, fontSize: 14 }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: T.text.muted, fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ color: entry.color, fontWeight: 800 }}>
              {entry.name === 'Revenue' || entry.name === 'Pipeline Value ($)' ? `$${Number(entry.value).toLocaleString()}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  const isCRM      = ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'].includes(user?.role);
  const isHRM      = ['Admin', 'CEO / Founder', 'HR Manager'].includes(user?.role);
  const isSupport  = ['Admin', 'CEO / Founder', 'Support Agent'].includes(user?.role);
  const isAdmin    = ['Admin', 'CEO / Founder'].includes(user?.role);
  const isStaff     = user?.role === 'Regular Employee';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/stats`, { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const activityItems = [
    { icon: '🎯', text: 'New lead captured from website', time: '5 min ago', color: T.brand.pink, roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'] },
    { icon: '✅', text: 'Leave request approved for team member', time: '22 min ago', color: T.status.success, roles: ['Admin', 'CEO / Founder', 'HR Manager'] },
    { icon: '🎫', text: 'Support ticket #245 escalated to High priority', time: '1 hr ago', color: T.status.warning, roles: ['Admin', 'CEO / Founder', 'Support Agent'] },
    { icon: '👤', text: 'New employee profile onboarded', time: '2 hrs ago', color: T.brand.indigo, roles: ['Admin', 'CEO / Founder', 'HR Manager'] },
    { icon: '📣', text: 'Company announcement posted', time: '3 hrs ago', color: T.brand.orange, roles: null },
  ].filter(a => !a.roles || a.roles.includes(user?.role));

  const priorities = [
    { icon: '⚠️', text: 'SLA breach warning: Ticket #882 overdue', type: 'danger', roles: ['Admin', 'CEO / Founder', 'Support Agent'] },
    { icon: '📋', text: `${stats?.leaves?.pending || 0} leave request(s) pending approval`, type: 'warning', roles: ['Admin', 'CEO / Founder', 'HR Manager'] },
    { icon: '🎯', text: 'Q4 campaign launch due this week', type: 'info', roles: ['Admin', 'CEO / Founder', 'Marketing Specialist'] },
    { icon: '👥', text: 'Monthly payroll run pending for this month', type: 'warning', roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Accountant'] },
  ].filter(p => !p.roles || p.roles.includes(user?.role));

  return (
    <div style={{ maxWidth: 3000, margin: '0 auto', width: '100%' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(28px, 3vw, 42px)', fontWeight: 900, color: T.text.primary, marginBottom: 8, letterSpacing: '-0.5px' }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ fontSize: 'clamp(14px, 1vw, 18px)', color: T.text.muted, fontWeight: 500 }}>
              {time.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} <span style={{ margin:'0 10px', color: T.border.medium }}>|</span> Role: <strong style={{ color: T.text.primary }}>{user?.role}</strong>
            </p>
          </div>
          <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: '16px 32px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 'clamp(32px, 3vw, 48px)', fontWeight: 900, color: T.brand.indigo, fontFamily: 'monospace', letterSpacing: 2 }}>
              {time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: 'clamp(12px, 0.8vw, 14px)', color: T.text.subtle, marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>Local Time</div>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {(isCRM || isAdmin) && (
          <>
            <KPICard icon="🎯" label="Total Leads" value={loading ? '...' : stats?.leads?.total ?? 0} color={T.brand.indigo} trend="+12%" />
            <KPICard icon="💰" label="Pipeline Value" value={loading ? '...' : `$${Number(stats?.leads?.totalValue||0).toLocaleString()}`} color={T.brand.pink} sub="Total lead value" />
          </>
        )}
        {(isSupport || isAdmin) && (
          <KPICard icon="🎫" label="Open Tickets" value={loading ? '...' : stats?.tickets?.open ?? 0} color={T.status.warning} sub="Requires attention" />
        )}
        {(isHRM || isAdmin) && (
          <>
            <KPICard icon="👤" label="Active Employees" value={loading ? '...' : stats?.employees?.total ?? 0} color={T.status.success} trend="+2" />
            <KPICard icon="🌴" label="Pending Leaves" value={loading ? '...' : stats?.leaves?.pending ?? 0} color={T.status.danger} sub="Awaiting approval" />
          </>
        )}
        {isStaff && (
          <>
            <KPICard icon="📋" label="My Tasks" value="4" color={T.brand.indigo} sub="Assigned to you" />
            <KPICard icon="🏖️" label="My Leaves" value="12" color={T.status.success} sub="Remaining balance" />
          </>
        )}
      </div>

      {/* Analytics Charts Grid */}
      {(isCRM || isAdmin) && (
        <>
          <SectionHeader title="Analytics & Trends" icon="📈" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 24 }}>
            
            {/* Line Chart: Lead Growth */}
            <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 'clamp(16px, 1vw, 20px)', fontWeight: 800 }}>Lead Growth & Revenue Pipeline</h3>
                <p style={{ fontSize: 'clamp(13px, 0.8vw, 15px)', color: T.text.muted, marginTop: 6 }}>Monthly trend of new leads vs projected pipeline revenue.</p>
              </div>
              <div style={{ flex: 1, minHeight: 350 }}>
                {loading ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:T.text.muted}}>Loading...</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.leadGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.brand.indigo} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={T.brand.indigo} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={T.brand.pink} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={T.brand.pink} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border.light} />
                      <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{fill: T.text.muted, fontSize: 13, fontWeight: 600}} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: T.text.muted, fontSize: 13}} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: T.text.muted, fontSize: 13}} tickFormatter={v => `$${v/1000}k`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 13, fontWeight: 700 }} />
                      <Area yAxisId="left" type="monotone" dataKey="leads" name="New Leads" stroke={T.brand.indigo} strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                      <Area yAxisId="right" type="monotone" dataKey="revenue" name="Pipeline Value ($)" stroke={T.brand.pink} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Twin Charts Container for Sources & Tickets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              
              {/* Pie Chart: Lead Sources */}
              <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 'clamp(15px, 1vw, 18px)', fontWeight: 800 }}>Lead Sources</h3>
                  <p style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>Where are leads coming from?</p>
                </div>
                <div style={{ flex: 1, minHeight: 250 }}>
                  {loading ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:T.text.muted}}>Loading...</div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats?.leadSources || []} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                          {(stats?.leadSources || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 20 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Bar Chart: Ticket Status */}
              <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 'clamp(15px, 1vw, 18px)', fontWeight: 800 }}>Ticket Overview</h3>
                  <p style={{ fontSize: 13, color: T.text.muted, marginTop: 4 }}>Support tickets by current status.</p>
                </div>
                <div style={{ flex: 1, minHeight: 250 }}>
                  {loading ? <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:T.text.muted}}>Loading...</div> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.ticketStatuses || []} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={T.border.light} />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: T.text.muted, fontSize: 12}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: T.text.primary, fontSize: 13, fontWeight: 700}} width={80} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{fill: T.surface.page}} />
                        <Bar dataKey="value" name="Tickets" radius={[0, 4, 4, 0]}>
                          {(stats?.ticketStatuses || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'Closed' ? T.status.success : entry.name === 'In Progress' ? T.brand.indigo : T.status.warning} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Secondary Row: Activity + ActionItems */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 40 }}>
        {/* Recent Activity */}
        <div style={{ flex: '1 1 500px', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border.light}` }}>
            <h3 style={{ fontSize: 'clamp(16px, 1.2vw, 20px)', fontWeight: 800 }}>🚀 Recent Activity Feed</h3>
          </div>
          <div style={{ padding: '12px 0' }}>
            {activityItems.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', borderBottom: i < activityItems.length - 1 ? `1px solid ${T.border.light}` : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'clamp(14px, 1vw, 16px)', color: T.text.primary, fontWeight: 600 }}>{a.text}</div>
                  <div style={{ fontSize: 12, color: T.text.subtle, marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Required & Quick Links */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Priorities */}
          <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden', flex: 1 }}>
            <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border.light}` }}>
              <h3 style={{ fontSize: 'clamp(16px, 1.2vw, 20px)', fontWeight: 800 }}>📅 Action Required</h3>
            </div>
            <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {priorities.map((p, i) => {
                const bg = p.type === 'danger' ? 'rgba(239,68,68,0.08)' : p.type === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)';
                const br = p.type === 'danger' ? 'rgba(239,68,68,0.2)' : p.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)';
                const cl = p.type === 'danger' ? T.status.danger : p.type === 'warning' ? T.status.warning : T.status.info;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: bg, border: `1px solid ${br}`, borderRadius: T.radius.md, transition: '0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <span style={{ fontSize: 24 }}>{p.icon}</span>
                    <span style={{ fontSize: 'clamp(13px, 1vw, 15px)', color: cl, fontWeight: 700, flex: 1 }}>{p.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: '24px 28px' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.text.subtle, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>Jump to Action</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: '+ Quick Lead',   color: T.brand.indigo, nav: 'crm-leads', roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Marketing Specialist'] },
                { label: '+ New Contact',  color: T.brand.indigo, nav: 'crm-contacts', roles: ['Admin', 'CEO / Founder', 'Sales Representative', 'Support Agent'] },
                { label: '+ New Campaign', color: T.brand.pink, nav: 'crm-marketing', roles: ['Admin', 'CEO / Founder', 'Marketing Specialist'] },
                { label: '+ New Project',  color: T.brand.emerald, nav: 'crm-projects', roles: ['Admin', 'CEO / Founder', 'Project Manager', 'Sales Representative'] },
                { label: '+ New Task',     color: T.status.warning, nav: 'crm-tasks', roles: ['Admin', 'CEO / Founder', 'Project Manager', 'Support Agent', 'Sales Representative'] },
                { label: '+ New Ticket',   color: T.status.info, nav: 'crm-tickets', roles: ['Admin', 'CEO / Founder', 'Support Agent', 'Sales Representative'] },
                { label: '+ New Invoice',  color: T.brand.pink, nav: 'crm-invoices', roles: ['Admin', 'CEO / Founder', 'Accountant', 'Sales Representative'] },
                { label: '+ Request Leave',color: T.status.success, nav: 'hrm-leaves', roles: null },
                { label: '+ Add Employee', color: T.brand.orange, nav: 'hrm-staff', roles: ['Admin', 'CEO / Founder', 'HR Manager'] },
                { label: '+ Post News',    color: T.status.info, nav: 'collab-news', roles: ['Admin', 'CEO / Founder', 'HR Manager', 'Marketing Specialist'] },
              ].filter(q => !q.roles || q.roles.includes(user?.role)).map(q => (
                <button key={q.label} onClick={() => window.dispatchEvent(new CustomEvent('nav-change', { detail: q.nav }))}
                  style={{ padding: '12px', background: `${q.color}10`, border: `1px solid ${q.color}30`, borderRadius: T.radius.md, color: q.color, fontSize: 'clamp(13px, 0.9vw, 15px)', fontWeight: 800, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${q.color}20`; e.currentTarget.style.borderColor = `${q.color}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${q.color}10`; e.currentTarget.style.borderColor = `${q.color}30`; }}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
