import React from 'react';
import theme from '../config/theme';
import { DB_KEYS } from '../config/db';
import useDB from '../hooks/useDB';
import PageHeader from '../components/ui/PageHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const T = theme;

function ReportsPage() {
  const contacts  = useDB(DB_KEYS.CONTACTS);
  const companies = useDB(DB_KEYS.COMPANIES);
  const leads     = useDB(DB_KEYS.LEADS);
  const contracts = useDB(DB_KEYS.CONTRACTS);
  const invoices  = useDB(DB_KEYS.INVOICES);
  const products  = useDB(DB_KEYS.PRODUCTS);
  const projects  = useDB(DB_KEYS.PROJECTS);
  const tickets   = useDB(DB_KEYS.TICKETS);

  // Loading state abstraction
  const loading = contacts.loading || companies.loading || leads.loading || 
                  contracts.loading || invoices.loading || products.loading || 
                  projects.loading || tickets.loading;

  // -- Data Aggregations --
  
  // 1. Entities Count overview
  const entityData = [
    { name: 'Contacts', count: contacts.items.length },
    { name: 'Companies', count: companies.items.length },
    { name: 'Leads', count: leads.items.length },
    { name: 'Projects', count: projects.items.length },
    { name: 'Products', count: products.items.length },
    { name: 'Tickets', count: tickets.items.length },
  ];

  // 2. Financial Overview (Invoices)
  const paidInvoices = invoices.items.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount||0), 0);
  const unpaidInvoices = invoices.items.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + Number(i.amount||0), 0);
  const invoiceData = [
    { name: 'Paid', value: paidInvoices },
    { name: 'Unpaid/Draft', value: unpaidInvoices },
  ];
  const COLORS = [T.brand.emerald, T.brand.pink];

  // 3. Ticket Status Summary
  const ticketsByStatus = tickets.items.reduce((acc, t) => {
    const status = t.status || 'Unassigned';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const ticketData = Object.keys(ticketsByStatus).map(key => ({ name: key, count: ticketsByStatus[key] }));

  // 4. Project Status Summary
  const projectsByStatus = projects.items.reduce((acc, p) => {
    const status = p.status || 'Unassigned';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const projectData = Object.keys(projectsByStatus).map(key => ({ name: key, count: projectsByStatus[key] }));

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading Reports...</div>;

  return (
    <div>
      <PageHeader title="Reports & Analytics" count={entityData.reduce((sum, d) => sum + d.count, 0)}>
        <p style={{color: T.text.muted}}>High-level business intelligence dashboard.</p>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        
        {/* Entity Overview Bar Chart */}
        <div style={{ background: T.surface.card, padding: 20, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 15 }}>Database Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={entityData}>
              <XAxis dataKey="name" stroke={T.text.muted} fontSize={12} />
              <YAxis stroke={T.text.muted} fontSize={12} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: T.surface.modal, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
              <Bar dataKey="count" fill={T.brand.indigo} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Collections Pie Chart */}
        <div style={{ background: T.surface.card, padding: 20, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 15 }}>Invoiced Revenue ($)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={invoiceData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                {invoiceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{background: T.surface.modal, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Distribution */}
        <div style={{ background: T.surface.card, padding: 20, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 15 }}>Support Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketData} layout="vertical">
              <XAxis type="number" stroke={T.text.muted} fontSize={12} />
              <YAxis dataKey="name" type="category" width={100} stroke={T.text.muted} fontSize={12} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: T.surface.modal, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
              <Bar dataKey="count" fill={T.brand.orange} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Distribution */}
        <div style={{ background: T.surface.card, padding: 20, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
          <h3 style={{ fontSize: 16, marginBottom: 15 }}>Projects by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectData} layout="vertical">
              <XAxis type="number" stroke={T.text.muted} fontSize={12} />
              <YAxis dataKey="name" type="category" width={100} stroke={T.text.muted} fontSize={12} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background: T.surface.modal, border: `1px solid ${T.border.light}`, borderRadius: T.radius.md}} />
              <Bar dataKey="count" fill={T.brand.purple} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

export default ReportsPage;
