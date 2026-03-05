// =============================================================================
// src/pages/PaymentsPage.jsx
// =============================================================================
import React, { useState, useMemo } from 'react';
import theme from '../config/theme';
import { DB_KEYS, OPTIONS } from '../config/db';
import useDB from '../hooks/useDB';
import DataTable, { TR, TD } from '../components/ui/DataTable';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDate, formatMoney, formatMoneyCompact, generateId } from '../utils/formatters';
import { required } from '../utils/validators';

const T = theme;
const DEFAULT_FORM = { client:'', invoiceRef:'', amount:'', method:'Cash', transactionId:'', date:'', notes:'' };

function PaymentsPage({ invoices, companies, contacts }) {
  const { items: payments, loading, add, remove } = useDB(DB_KEYS.PAYMENTS);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() =>
    payments.filter(p=>[p.client,p.invoiceRef,p.transactionId].some(v=>v?.toLowerCase().includes(search.toLowerCase()))),
    [payments,search]
  );

  const totalReceived = payments.reduce((s,p)=>s+(Number(p.amount)||0),0);
  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };

  const handleSave = async () => {
    const e={};
    const ce=required(form.client,'Client'); if(ce) e.client=ce;
    const ae=required(form.amount,'Amount'); if(ae) e.amount=ae;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    await add({ ...form, transactionId: form.transactionId||`TXN${generateId().slice(0,8).toUpperCase()}` });
    setSaving(false); setModal(false); setForm(DEFAULT_FORM);
  };

  const handleDelete = async item => {
    if(!window.confirm('Delete this payment record?')) return;
    await remove(item.id);
  };

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Payments" count={payments.length}>
        <span style={{fontSize:13,color:T.text.muted}}>Received: <strong style={{color:T.status.success}}>{formatMoneyCompact(totalReceived)}</strong></span>
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments…" />
        <Button onClick={()=>{setForm(DEFAULT_FORM);setErrors({});setModal(true);}}>+ Record Payment</Button>
      </PageHeader>
      <DataTable columns={['Client','Invoice Ref','Amount','Method','Transaction ID','Date','Actions']}
        data={filtered} emptyIcon="💳" emptyTitle="No payments recorded" emptySubtitle="Record payments received from clients."
        onAdd={()=>{setForm(DEFAULT_FORM);setErrors({});setModal(true);}} addLabel="Record Payment"
        renderRow={p=>(
          <TR key={p.id}>
            <TD><strong>{p.client}</strong></TD>
            <TD style={{color:T.text.muted,fontFamily:'monospace',fontSize:11}}>{p.invoiceRef||'—'}</TD>
            <TD style={{color:T.status.success,fontWeight:700,fontSize:15}}>{formatMoney(p.amount)}</TD>
            <TD><Badge>{p.method}</Badge></TD>
            <TD style={{color:T.text.muted,fontFamily:'monospace',fontSize:11}}>{p.transactionId}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(p.date||p.createdAt)}</TD>
            <TD><Button size="sm" variant="danger" onClick={()=>handleDelete(p)}>Delete</Button></TD>
          </TR>
        )}
      />
      {modal && (
        <Modal title="Record Payment" onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Payment'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Select label="Client *"           value={form.client}     onChange={setField('client')} error={errors.client}>
              <option value="">Select client</option>
              {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              {contacts.map(c=><option key={c.id}  value={c.name}>{c.name}</option>)}
            </Select>
            <Select label="Invoice Reference"  value={form.invoiceRef} onChange={setField('invoiceRef')}>
              <option value="">Select invoice (optional)</option>
              {invoices.map(i=><option key={i.id} value={i.invoiceId}>{i.invoiceId} — {i.client}</option>)}
            </Select>
            <Input label="Amount ($) *"        value={form.amount}     onChange={setField('amount')}    placeholder="0" type="number" error={errors.amount} />
            <Select label="Payment Method"     value={form.method}     onChange={setField('method')}>
              {OPTIONS.paymentMethods.map(m=><option key={m}>{m}</option>)}
            </Select>
            <Input label="Transaction ID"      value={form.transactionId} onChange={setField('transactionId')} placeholder="Auto-generated if blank" />
            <Input label="Payment Date"        value={form.date}       onChange={setField('date')}      type="date" />
            <div style={{gridColumn:'1/-1'}}>
              <Textarea label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Payment notes…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PaymentsPage;
