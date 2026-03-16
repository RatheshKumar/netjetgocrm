// =============================================================================
// src/pages/erp/ERPDashboardPage.jsx
// =============================================================================
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import theme from '../../config/theme';
import storage from '../../utils/storage';
import { DB_KEYS } from '../../config/db';
import { useAuth } from '../../context/AuthContext';

const T = theme;

function KPICard({ icon, label, value, sub, color = T.brand.indigo }) {
  return (
    <div style={{ background: T.surface.card, borderRadius: T.radius.lg, padding: '20px 22px', border: `1px solid ${T.border.light}`, flex: 1, minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: T.radius.md, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.text.muted, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: T.status.success, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

function useERPData(key) {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      const all = await storage.getAll(key);
      setItems(all || []);
    })();
  }, [key]);
  return items;
}

function ERPDashboardPage() {
  const { erpUser } = useAuth();
  const inventory = useERPData(DB_KEYS.ERP_INVENTORY);
  const sales     = useERPData(DB_KEYS.ERP_POS_SALES);
  const employees = useERPData(DB_KEYS.ERP_EMPLOYEES);
  const purchases = useERPData(DB_KEYS.ERP_PURCHASES);

  const totalRevenue  = useMemo(() => sales.reduce((s, sale) => s + (sale.total || 0), 0), [sales]);
  const totalSales    = sales.length;
  const totalItems    = inventory.reduce((s, i) => s + (i.stock || 0), 0);
  const lowStockItems = inventory.filter(i => (i.stock || 0) <= (i.lowStockThreshold || 5));
  const activeEmployees = employees.filter(e => e.status === 'Active').length;

  // Weekly sales chart (last 7 days)
  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      const daySales = sales.filter(s => (s.createdAt || '').startsWith(dateStr));
      days.push({ day: label, revenue: daySales.reduce((sum, s) => sum + (s.total || 0), 0), count: daySales.length });
    }
    return days;
  }, [sales]);

  const recentSales = [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text.primary, letterSpacing: '-0.02em' }}>
          Good {getGreeting()}, {erpUser?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: T.text.muted, fontSize: 13, marginTop: 3 }}>
          {erpUser?.shopName ? `Here's what's happening at ${erpUser.shopName} today.` : "Here's what's happening in your store today."}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <KPICard icon="💰" label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub={`${totalSales} sales`} color={T.status.success} />
        <KPICard icon="📦" label="Total Stock Units" value={totalItems.toLocaleString()} sub={lowStockItems.length > 0 ? `⚠ ${lowStockItems.length} low stock` : '✓ Stock OK'} color={T.brand.orange} />
        <KPICard icon="👥" label="Active Employees" value={activeEmployees} sub={`${employees.length} total staff`} color={T.brand.pink} />
        <KPICard icon="🛒" label="Pending Purchases" value={purchases.filter(p => p.status === 'Ordered').length} sub={`${purchases.length} total orders`} color={T.status.info} />
      </div>

      {/* Charts + Low Stock Row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {/* Weekly Sales Chart */}
        <div style={{ flex: 2, background: T.surface.card, borderRadius: T.radius.lg, padding: 20, border: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 16 }}>📈 Weekly Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border.light} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: T.text.muted }} />
              <YAxis tick={{ fontSize: 11, fill: T.text.muted }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 8, border: `1px solid ${T.border.light}`, fontSize: 12 }} />
              <Bar dataKey="revenue" fill={T.brand.indigo} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div style={{ flex: 1, background: T.surface.card, borderRadius: T.radius.lg, padding: 20, border: `1px solid ${T.border.light}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary, marginBottom: 14 }}>⚠️ Low Stock Alerts</div>
          {lowStockItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: T.text.muted }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 12 }}>All stock levels are healthy!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStockItems.slice(0, 6).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: T.radius.md, border: '1px solid rgba(239,68,68,0.15)' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text.primary }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: T.text.muted }}>{item.category}</div>
                  </div>
                  <span style={{ background: 'rgba(239,68,68,0.1)', color: T.status.danger, borderRadius: 8, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{item.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sales */}
      <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text.primary }}>🧾 Recent Transactions</div>
          <span style={{ fontSize: 11, color: T.text.muted }}>{recentSales.length} of {totalSales}</span>
        </div>
        {recentSales.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: T.text.muted, fontSize: 13 }}>No sales recorded yet. Use the POS to record your first sale.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: T.surface.page }}>
                {['Sale ID', 'Items', 'Payment', 'Total', 'Date'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, i) => (
                <tr key={sale.id} style={{ borderTop: `1px solid ${T.border.light}`, background: i % 2 === 0 ? 'transparent' : T.surface.page }}>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, color: T.brand.indigo }}>#{sale.id?.slice(-6)}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: T.text.muted }}>{sale.items?.length || 0} item(s)</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, color: T.text.muted }}>{sale.paymentMethod}</td>
                  <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: T.status.success }}>₹{(sale.total || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px 16px', fontSize: 11, color: T.text.muted }}>{new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default ERPDashboardPage;
