import React, { useState, useMemo, useCallback, useEffect } from 'react';
import theme from '../config/theme';
import { OPTIONS } from '../config/db';
import DataTable, { TR, TD } from '../components/ui/DataTable';
import { Input, Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDate, formatMoney, formatMoneyCompact, generateId } from '../utils/formatters';
import { required } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import { authHeader, API_BASE } from '../utils/api';

const T = theme;
const DEFAULT_FORM = { clientName:'', invoiceId:'', amount:'', method:'Cash', date:'', notes:'' };

function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments]   = useState([]);
  const [invoices, setInvoices]   = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const canEdit = ['Admin', 'CEO / Founder', 'Accountant'].includes(user?.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, iRes, coRes, cnRes] = await Promise.all([
        fetch(`${API_BASE}/api/crm/payments`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/crm/invoices`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/crm/companies`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/crm/contacts`, { headers: authHeader() })
      ]);
      const pData  = await pRes.json();
      const iData  = await iRes.json();
      const coData = await coRes.json();
      const cnData = await cnRes.json();
      setPayments(Array.isArray(pData) ? pData : []);
      setInvoices(Array.isArray(iData) ? iData : []);
      setCompanies(Array.isArray(coData) ? coData : []);
      setContacts(Array.isArray(cnData) ? cnData : []);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() =>
    payments.filter(p=>[p.clientName,p.invoiceId,p.method].some(v=>v?.toLowerCase().includes(search.toLowerCase()))),
    [payments,search]
  );

  const totalReceived = payments.reduce((s,p)=>s+(Number(p.amount)||0),0);
  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };

  const handleSave = async () => {
    const e={};
    const ce=required(form.clientName,'Client'); if(ce) e.clientName=ce;
    const ae=required(form.amount,'Amount'); if(ae) e.amount=ae;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    try {
      await fetch(`${API_BASE}/api/crm/payments`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ clientName: form.clientName, invoiceId: form.invoiceId, amount: form.amount, method: form.method, status: 'Completed', paymentDate: form.date || null, notes: form.notes })
      });
      setModal(false);
      setForm(DEFAULT_FORM);
      fetchData();
    } catch (err) {
      alert('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async item => {
    if(!window.confirm('Delete this payment record?')) return;
    await fetch(`${API_BASE}/api/crm/payments/${item.id}`, { method: 'DELETE', headers: authHeader() });
    fetchData();
  };

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Payments" count={payments.length}>
        <span style={{fontSize:13,color:T.text.muted}}>Received: <strong style={{color:T.status.success}}>{formatMoneyCompact(totalReceived)}</strong></span>
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments…" />
        {canEdit && <Button onClick={()=>{setForm(DEFAULT_FORM);setErrors({});setModal(true);}}>+ Record Payment</Button>}
      </PageHeader>
      <DataTable columns={['Client','Invoice Ref','Amount','Method','Status','Date','Actions']}
        data={filtered} emptyIcon="💳" emptyTitle="No payments recorded" emptySubtitle="Record payments received from clients."
        onAdd={()=>{setForm(DEFAULT_FORM);setErrors({});setModal(true);}} addLabel="Record Payment"
        renderRow={p=>(
          <TR key={p.id}>
            <TD><strong>{p.clientName}</strong></TD>
            <TD style={{color:T.text.muted,fontFamily:'monospace',fontSize:11}}>{p.invoiceId||'—'}</TD>
            <TD style={{color:T.status.success,fontWeight:700,fontSize:15}}>{formatMoney(p.amount)}</TD>
            <TD><Badge>{p.method}</Badge></TD>
            <TD><Badge>{p.status||'Completed'}</Badge></TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(p.paymentDate||p.createdAt)}</TD>
            <TD>{canEdit && <Button size="sm" variant="danger" onClick={()=>handleDelete(p)}>Delete</Button>}</TD>
          </TR>
        )}
      />
      {modal && (
        <Modal title="Record Payment" onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Payment'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Select label="Client *"           value={form.clientName}     onChange={setField('clientName')} error={errors.clientName}>
              <option value="">Select client</option>
              {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              {contacts.map(c=><option key={c.id}  value={c.name}>{c.name}</option>)}
            </Select>
            <Select label="Invoice Reference"  value={form.invoiceId} onChange={setField('invoiceId')}>
              <option value="">Select invoice (optional)</option>
              {invoices.map(i=><option key={i.id} value={i.invoiceNumber}>{i.invoiceNumber} — {i.clientName}</option>)}
            </Select>
            <Input label="Amount ($) *"        value={form.amount}     onChange={setField('amount')}    placeholder="0" type="number" error={errors.amount} />
            <Select label="Payment Method"     value={form.method}     onChange={setField('method')}>
              {OPTIONS.paymentMethods.map(m=><option key={m}>{m}</option>)}
            </Select>
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
