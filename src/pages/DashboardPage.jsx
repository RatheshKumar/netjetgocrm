// =============================================================================
// src/pages/DashboardPage.jsx
// =============================================================================
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import theme from '../config/theme';
import StatCard   from '../components/ui/StatCard';
import Badge      from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import { formatMoneyCompact } from '../utils/formatters';

const T = theme;
const PIE_COLORS = [T.status.success, T.status.danger, T.status.info, T.status.warning, T.text.muted];
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Dashboard — shows KPI cards, revenue chart, lead breakdown, recent activity.
 *
 * Props: all data arrays (contacts, companies, leads, invoices, payments, tasks)
 */
function DashboardPage({ contacts, companies, leads, invoices, payments, tasks }) {

  // ── KPI values ────────────────────────────────────────────────────────────
  const totalInvoiced = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPaid     = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const openTasks     = tasks.filter(t => t.status !== 'Completed').length;
  const activeLeads   = leads.filter(l => ['Pending','In Progress'].includes(l.status)).length;
  const wonLeads      = leads.filter(l => l.status === 'Won').length;

  // ── Chart data ────────────────────────────────────────────────────────────
  const revenueByMonth = useMemo(() => MONTHS.map(m => ({
    month:    m,
    Invoiced: invoices.filter(i => i.createdAt && new Date(i.createdAt).toLocaleString('en', { month: 'short' }) === m).reduce((s, i) => s + (Number(i.amount) || 0), 0),
    Received: payments.filter(p => p.createdAt && new Date(p.createdAt).toLocaleString('en', { month: 'short' }) === m).reduce((s, p) => s + (Number(p.amount) || 0), 0),
  })), [invoices, payments]);

  const leadsByStatus = ['Won','Lost','Pending','In Progress','Closed']
    .map(s => ({ name: s, value: leads.filter(l => l.status === s).length }))
    .filter(d => d.value > 0);

  const stats = [
    { label: 'Total Contacts', value: contacts.length,            icon: '👤', color: T.brand.indigo,  sub: `${companies.length} companies` },
    { label: 'Active Leads',   value: activeLeads,                icon: '📈', color: T.status.warning, sub: `${wonLeads} won` },
    { label: 'Invoiced',       value: formatMoneyCompact(totalInvoiced), icon: '🧾', color: T.status.success, sub: `${formatMoneyCompact(totalPaid)} received` },
    { label: 'Open Tasks',     value: openTasks,                  icon: '✅', color: T.status.danger,  sub: `${tasks.filter(t => t.status === 'Completed').length} done` },
  ];

  const isEmpty = contacts.length === 0 && leads.length === 0;

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {isEmpty ? (
        <EmptyState
          icon="🚀"
          title="Your CRM is ready!"
          subtitle="Start by adding contacts, companies, and leads using the sidebar navigation. All data is saved automatically."
        />
      ) : (
        <>
          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>

            {/* Revenue bar chart */}
            <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: '0 0 14px' }}>Revenue Overview</h3>
              <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                {[{ label: 'Invoiced', color: T.brand.indigo }, { label: 'Received', color: T.status.success }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.text.muted }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={revenueByMonth} barGap={3}>
                  <XAxis dataKey="month" tick={{ fill: T.text.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.text.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 11 }} />
                  <Bar dataKey="Invoiced" fill={T.brand.indigo} radius={[3,3,0,0]} />
                  <Bar dataKey="Received" fill={T.status.success} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leads donut */}
            <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: '0 0 14px' }}>Leads by Status</h3>
              {leadsByStatus.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart width={155} height={135}>
                      <Pie data={leadsByStatus} innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={3}>
                        {leadsByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 11 }} />
                    </PieChart>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6, justifyContent: 'center' }}>
                    {leadsByStatus.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                        <div style={{ width: 7, height: 7, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span style={{ color: T.text.muted }}>{d.name}: <strong style={{ color: T.text.primary }}>{d.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyState icon="📊" title="No leads yet" subtitle="" />}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* Recent Leads */}
            <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: '0 0 12px' }}>Recent Leads</h3>
              {leads.length === 0
                ? <EmptyState icon="📈" title="No leads yet" subtitle="" />
                : leads.slice(0, 5).map((l, i) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: i < 4 ? `1px solid ${T.border.light}` : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.name}</div>
                      <div style={{ fontSize: 11, color: T.text.muted }}>{l.company || '—'}</div>
                    </div>
                    <Badge>{l.status}</Badge>
                  </div>
                ))
              }
            </div>

            {/* Open Tasks */}
            <div style={{ background: T.surface.card, border: `1px solid ${T.border.light}`, borderRadius: T.radius.lg, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: T.text.primary, margin: '0 0 12px' }}>Open Tasks</h3>
              {openTasks === 0
                ? <EmptyState icon="✅" title="All tasks complete!" subtitle="" />
                : tasks.filter(t => t.status !== 'Completed').slice(0, 5).map((t, i, arr) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.border.light}` : 'none' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.priority === 'High' ? T.status.danger : t.priority === 'Medium' ? T.status.warning : T.status.success, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13 }}>{t.title}</span>
                    <Badge>{t.priority}</Badge>
                  </div>
                ))
              }
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
