// =============================================================================
// src/pages/erp/POSPage.jsx  — Point of Sale Terminal
// =============================================================================
import React, { useState } from 'react';
import theme from '../../config/theme';
import { OPTIONS, DB_KEYS } from '../../config/db';
import useDB from '../../hooks/useDB';

const T = theme;

export default function POSPage() {
  const inventory  = useDB(DB_KEYS.ERP_INVENTORY);
  const posSales   = useDB(DB_KEYS.ERP_POS_SALES);

  const [cart,          setCart]          = useState([]); // {item, qty}
  const [search,        setSearch]        = useState('');
  const [payMethod,     setPayMethod]     = useState('Cash');
  const [discount,      setDiscount]      = useState(0);
  const [customerName,  setCustomerName]  = useState('');
  const [success,       setSuccess]       = useState(false);

  const inStockItems = inventory.items.filter(i => (i.stock || 0) > 0);

  const filtered = inStockItems.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q);
  });

  const addToCart = item => {
    setCart(prev => {
      const ex = prev.find(c => c.item.id === item.id);
      if (ex) {
        if (ex.qty >= item.stock) return prev;
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { setCart(p => p.filter(c => c.item.id !== id)); return; }
    setCart(p => p.map(c => c.item.id === id ? { ...c, qty: Math.min(qty, c.item.stock) } : c));
  };

  const subtotal = cart.reduce((s, c) => s + (c.item.sellingPrice || 0) * c.qty, 0);
  const discAmt  = Math.min(Number(discount) || 0, subtotal);
  const taxAmt   = Math.round((subtotal - discAmt) * 0.18);  // 18% GST
  const total    = subtotal - discAmt + taxAmt;

  const completeSale = async () => {
    if (cart.length === 0) return;
    const sale = {
      items: cart.map(c => ({ id: c.item.id, name: c.item.name, qty: c.qty, price: c.item.sellingPrice })),
      subtotal, discount: discAmt, tax: taxAmt, total,
      paymentMethod: payMethod,
      customer: customerName,
      createdAt: new Date().toISOString(),
    };
    await posSales.add(sale);
    // Decrement stock
    for (const { item, qty } of cart) {
      await inventory.update(item.id, { stock: Math.max(0, (item.stock || 0) - qty) });
    }
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 120px)' }}>

      {/* ── Left: Product Grid ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ marginBottom: 12 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products…" style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 13, background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, paddingRight: 4 }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: T.text.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 13 }}>No products in stock</div>
            </div>
          ) : filtered.map(item => {
            const inCart = cart.find(c => c.item.id === item.id);
            return (
              <div key={item.id} onClick={() => addToCart(item)} style={{ background: T.surface.card, borderRadius: T.radius.lg, padding: 14, border: `2px solid ${inCart ? T.brand.indigo : T.border.light}`, cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>
                  {item.category === 'Electronics' ? '📱' : item.category === 'Clothing' ? '👕' : item.category === 'Food & Beverage' ? '🍎' : '📦'}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text.primary, marginBottom: 4, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: T.text.muted }}>{item.category}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.brand.indigo, marginTop: 6 }}>₹{(item.sellingPrice || 0).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 10, color: T.text.subtle, marginTop: 2 }}>{item.stock} in stock</div>
                {inCart && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: T.brand.indigo, color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inCart.qty}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Cart + Checkout ────────────────────────────────────────── */}
      <div style={{ width: 320, background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text.primary }}>🧾 Cart</div>
          {cart.length > 0 && <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.status.danger, fontWeight: 600, fontFamily: 'inherit' }}>Clear all</button>}
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.text.muted }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 12 }}>Click products to add them</div>
            </div>
          ) : cart.map(({ item, qty }) => (
            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, padding: '10px 12px', background: T.surface.page, borderRadius: T.radius.md }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text.primary }}>{item.name}</div>
                <div style={{ fontSize: 11, color: T.text.muted }}>₹{(item.sellingPrice || 0).toLocaleString('en-IN')} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => updateQty(item.id, qty - 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${T.border.medium}`, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => updateQty(item.id, qty + 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: `1px solid ${T.border.medium}`, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.brand.indigo, minWidth: 60, textAlign: 'right' }}>₹{((item.sellingPrice || 0) * qty).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        {cart.length > 0 && (
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border.light}` }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Customer Name (Optional)</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in Customer" style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 12, background: T.surface.page, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Discount (₹)</label>
              <input type="number" min={0} value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 12, background: T.surface.page, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: T.text.muted, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 4 }}>Payment Method</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border.light}`, borderRadius: T.radius.md, fontSize: 12, background: T.surface.page, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: T.text.primary }}>
                {OPTIONS.erpPaymentMethods.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Totals */}
            <div style={{ borderTop: `1px solid ${T.border.light}`, paddingTop: 10 }}>
              {[['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`], ['Discount', `-₹${discAmt.toLocaleString('en-IN')}`], ['GST (18%)', `₹${taxAmt.toLocaleString('en-IN')}`]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: T.text.muted }}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: `2px solid ${T.border.medium}`, fontSize: 16, fontWeight: 800, color: T.text.primary }}>
                <span>Total</span><span style={{ color: T.brand.indigo }}>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Complete button */}
            {success ? (
              <div style={{ marginTop: 12, padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: T.radius.md, textAlign: 'center', color: T.status.success, fontWeight: 700, fontSize: 13 }}>✅ Sale Completed!</div>
            ) : (
              <button onClick={completeSale} style={{ width: '100%', marginTop: 12, padding: '12px 0', background: `linear-gradient(135deg,${T.brand.indigo},${T.brand.indigoMid})`, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(61,59,175,0.3)' }}>
                Complete Sale →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
