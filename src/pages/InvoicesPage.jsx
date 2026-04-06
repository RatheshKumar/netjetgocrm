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
import { formatDate, formatMoney, formatMoneyCompact } from '../utils/formatters';
import { required } from '../utils/validators';
import { useAuth } from '../context/AuthContext';

const T = theme;
const DEFAULT_FORM = { client:'', project:'', amount:'', paidAmount:'0', dueDate:'', status:'Unpaid', notes:'', assignedTo:'' };
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices]   = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState({ ...DEFAULT_FORM, assignedTo: user?.name || '' });
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const isAdmin = ['Admin', 'CEO / Founder', 'Accountant'].includes(user?.role);
  const canEdit = isAdmin || ['Sales Representative'].includes(user?.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, coRes, cnRes] = await Promise.all([
        fetch(`${API_BASE}/api/crm/invoices`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/crm/companies`, { headers: authHeader() }),
        fetch(`${API_BASE}/api/crm/contacts`, { headers: authHeader() })
      ]);
      const iData  = await iRes.json();
      const coData = await coRes.json();
      const cnData = await cnRes.json();
      setInvoices(Array.isArray(iData) ? iData : []);
      setCompanies(Array.isArray(coData) ? coData : []);
      setContacts(Array.isArray(cnData) ? cnData : []);
    } catch (err) {
      console.error('Failed to fetch invoice data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() =>
    invoices.filter(i=>[i.client,i.project,i.invoiceId].some(v=>v?.toLowerCase().includes(search.toLowerCase()))),
    [invoices,search]
  );

  const totalInvoiced = invoices.reduce((s,i)=>s+(Number(i.amount)||0),0);

  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e={}; const ce=required(form.client,'Client'); if(ce) e.client=ce;
    if(Object.keys(e).length>0){setErrors(e);return;}
    const invoiceNumber = editItem?.invoiceNumber || `INV-${Math.floor(Math.random()*9000+1000)}`;
    setSaving(true);
    try {
      const url = editItem ? `${API_BASE}/api/crm/invoices/${editItem.id}` : `${API_BASE}/api/crm/invoices`;
      const method = editItem ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify({ ...form, invoiceNumber })
      });
      setModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete invoice ${item.invoiceNumber}?`)) return;
    await fetch(`${API_BASE}/api/crm/invoices/${item.id}`, { method: 'DELETE', headers: authHeader() });
    fetchData();
  };

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Invoices" count={invoices.length}>
        <span style={{fontSize:13,color:T.text.muted}}>Total: <strong style={{color:T.status.success}}>{formatMoneyCompact(totalInvoiced)}</strong></span>
        <SearchBar value={search} onChange={setSearch} placeholder="Search invoices…" />
        {canEdit && <Button onClick={openAdd}>+ New Invoice</Button>}
      </PageHeader>
      <DataTable columns={['Invoice ID','Client','Project','Amount','Paid','Balance','Due Date','Status','Actions']}
        data={filtered} emptyIcon="🧾" emptyTitle="No invoices yet" emptySubtitle="Create invoices to track client billing." onAdd={openAdd} addLabel="New Invoice"
        renderRow={inv=>{
          const balance=(Number(inv.amount)||0)-(Number(inv.paidAmount)||0);
          return (
            <TR key={inv.id}>
              <TD style={{color:T.brand.indigo,fontFamily:'monospace',fontSize:11,fontWeight:600}}>{inv.invoiceNumber}</TD>
              <TD><strong>{inv.client}</strong></TD>
              <TD style={{color:T.text.muted}}>{inv.project||'—'}</TD>
              <TD style={{fontWeight:600}}>{formatMoney(inv.amount)}</TD>
              <TD style={{color:T.status.success}}>{formatMoney(inv.paidAmount)}</TD>
              <TD style={{color:balance>0?T.status.danger:T.status.success,fontWeight:600}}>{formatMoney(balance)}</TD>
              <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(inv.dueDate)}</TD>
              <TD><Badge>{inv.status}</Badge></TD>
              <TD><div style={{display:'flex',gap:6}}>
                {canEdit && <Button size="sm" variant="secondary" onClick={()=>openEdit(inv)}>Edit</Button>}
                {canEdit && <Button size="sm" variant="danger"    onClick={()=>handleDelete(inv)}>Delete</Button>}
              </div></TD>
            </TR>
          );
        }}
      />
      {modal && (
        <Modal title={editItem?'Edit Invoice':'New Invoice'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Invoice'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Select label="Client *"          value={form.client}      onChange={setField('client')} error={errors.client}>
              <option value="">Select client</option>
              {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              {contacts.map(c=><option key={c.id}  value={c.name}>{c.name}</option>)}
            </Select>
            <Input label="Project / Description" value={form.project}  onChange={setField('project')}  placeholder="e.g. Website Redesign" />
            <Input label="Total Amount ($)"    value={form.amount}     onChange={setField('amount')}   placeholder="0" type="number" />
            <Input label="Amount Paid ($)"     value={form.paidAmount} onChange={setField('paidAmount')} placeholder="0" type="number" />
            <Input label="Due Date"            value={form.dueDate}    onChange={setField('dueDate')}  type="date" />
            <Select label="Status"             value={form.status}     onChange={setField('status')}>
              {OPTIONS.invoiceStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <div style={{gridColumn:'1/-1'}}>
              <Textarea label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Invoice notes…" />
            </div>
            <Input label="Assigned To" value={form.assignedTo} onChange={setField('assignedTo')} placeholder="Owner Name" disabled={!isAdmin} />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default InvoicesPage;
