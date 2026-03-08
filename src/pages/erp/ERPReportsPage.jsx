// =============================================================================
// src/pages/erp/ERPReportsPage.jsx
// =============================================================================
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import theme from '../../config/theme';
import { DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;
const COLORS = [T.brand.indigo, T.brand.pink, T.brand.orange, T.status.info, T.status.success, '#8B5CF6', '#EC4899'];

export default function ERPReportsPage() {
  const sales     = useDB(DB_KEYS.ERP_POS_SALES);
  const inventory = useDB(DB_KEYS.ERP_INVENTORY);
  const payroll   = useDB(DB_KEYS.ERP_PAYROLL);

  const [range, setRange] = useState(30); // days

  const totalRevenue = useMemo(() => sales.items.reduce((s, sale) => s + (sale.total || 0), 0), [sales.items]);
  const totalCost    = useMemo(() => {
    const inv = inventory.items;
    return sales.items.reduce((sum, sale) => {
      return sum + (sale.items || []).reduce((s, lineItem) => {
        const prod = inv.find(p => p.id === lineItem.id);
        return s + (prod?.costPrice || 0) * (lineItem.qty || 0);
      }, 0);
    }, 0);
  }, [sales.items, inventory.items]);
  const grossProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  // Daily sales for range
  const dailyData = useMemo(() => {
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const daySales = sales.items.filter(s => (s.createdAt || '').startsWith(dateStr));
      days.push({ date: label, revenue: daySales.reduce((sum, s) => sum + (s.total || 0), 0), count: daySales.length });
    }
    return days;
  }, [sales.items, range]);

  // Top selling products
  const topProducts = useMemo(() => {
    const map = {};
    sales.items.forEach(sale => {
      (sale.items || []).forEach(li => {
        if (!map[li.name]) map[li.name] = { name: li.name, qty: 0, revenue: 0 };
        map[li.name].qty     += li.qty || 0;
        map[li.name].revenue += (li.price || 0) * (li.qty || 0);
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [sales.items]);

  // Payment method breakdown
  const payMethodData = useMemo(() => {
    const map = {};
    sales.items.forEach(s => {
      const m = s.paymentMethod || 'Unknown';
      map[m] = (map[m] || 0) + (s.total || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sales.items]);

  const totalPayroll = payroll.items.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.total || 0), 0);

  const kpis = [
    { icon: '💰', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: T.status.success },
    { icon: '📈', label: 'Gross Profit', value: `₹${grossProfit.toLocaleString('en-IN')}`, sub: `${margin}% margin`, color: T.brand.indigo },
    { icon: '🧾', label: 'Total Transactions', value: sales.items.length, color: T.brand.orange },
    { icon: '💸', label: 'Payroll Paid', value: `₹${totalPayroll.toLocaleString('en-IN')}`, color: T.brand.pink },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: T.text.primary }}>Sales Reports & Analytics</h2>
        <p style={{ color: T.text.muted, fontSize: 12, marginTop: 2 }}>Complete business performance overview</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        {kpis.map(kpi => (
          <div key={kpi.label} style={{ background: T.surface.card, borderRadius: T.radius.lg, padding: '18px 20px', flex: 1, minWidth: 160, border: `1px solid ${T.border.light}` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: T.text.muted, marginTop: 3 }}>{kpi.label}</div>
            {kpi.sub && <div style={{ fontSize: 11, color: kpi.color, fontWeight: 600, marginTop: 2 }}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Range selector + Line chart */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>📈 Revenue Trend</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setRange(d)} style={{ padding: '4px 12px', border: `1px solid ${range === d ? T.brand.indigo : T.border.light}`, borderRadius: T.radius.md, background: range === d ? T.brand.indigoLight : '#fff', color: range === d ? T.brand.indigo : T.text.muted, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border.light} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.text.muted }} interval={range > 30 ? 6 : range > 7 ? 4 : 'preserveStartEnd'} />
            <YAxis tick={{ fontSize: 10, fill: T.text.muted }} tickFormatter={v => `₹${v}`} />
            <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: `1px solid ${T.border.light}`, fontSize: 12 }} />
            <Line type="monotone" dataKey="revenue" stroke={T.brand.indigo} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {/* Top Products */}
        <div style={{ flex: 2, background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>🏆 Top Selling Products</div>
          {topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.text.muted, fontSize: 13 }}>No sales data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border.light} />
                <XAxis type="number" tick={{ fontSize: 10, fill: T.text.muted }} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: T.text.muted }} width={90} />
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill={T.brand.indigo} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Payment Methods */}
        <div style={{ flex: 1, background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>💳 Payment Methods</div>
          {payMethodData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.text.muted, fontSize: 13 }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={payMethodData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {payMethodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`₹${v}`, 'Amount']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Inventory Value table */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>📦 Inventory Value Summary</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.page }}>
              {['Category', 'Products', 'Total Units', 'Cost Value', 'Retail Value', 'Potential Profit'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const cats = {};
              inventory.items.forEach(item => {
                const c = item.category || 'Uncategorised';
                if (!cats[c]) cats[c] = { products: 0, units: 0, costVal: 0, retailVal: 0 };
                cats[c].products++;
                cats[c].units    += item.stock || 0;
                cats[c].costVal  += (item.costPrice || 0) * (item.stock || 0);
                cats[c].retailVal+= (item.sellingPrice || 0) * (item.stock || 0);
              });
              return Object.entries(cats).map(([cat, d], i) => (
                <tr key={cat} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                  <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: T.text.primary }}>{cat}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: T.text.muted }}>{d.products}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: T.text.muted }}>{d.units}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: T.text.muted }}>₹{d.costVal.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: T.text.primary, fontWeight: 600 }}>₹{d.retailVal.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: T.status.success, fontWeight: 700 }}>₹{(d.retailVal - d.costVal).toLocaleString('en-IN')}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
