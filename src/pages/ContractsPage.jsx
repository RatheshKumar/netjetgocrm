// =============================================================================
// src/pages/ContractsPage.jsx
// =============================================================================
import React, { useState, useMemo } from 'react';
import theme from '../config/theme';
import { DB_KEYS, OPTIONS } from '../config/db';
import useDB from '../hooks/useDB';
import DataTable, { TR, TD } from '../components/ui/DataTable';
import { Input, Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDate, formatMoney } from '../utils/formatters';
import { required } from '../utils/validators';

const T = theme;
const DEFAULT_FORM = { subject:'', customer:'', value:'', type:'Service Agreement', startDate:'', endDate:'', status:'Active', description:'' };

function ContractsPage({ companies, contacts }) {
  const { items: contracts, loading, add, update, remove } = useDB(DB_KEYS.CONTRACTS);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(DEFAULT_FORM);
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const filtered = useMemo(() =>
    contracts.filter(c=>[c.subject,c.customer,c.type].some(v=>v?.toLowerCase().includes(search.toLowerCase()))),
    [contracts,search]
  );

  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e={}; const se=required(form.subject,'Subject'); if(se) e.subject=se;
    if(Object.keys(e).length>0){setErrors(e);return;}
    const contractId = editItem?.contractId || `#${Math.floor(Math.random()*9000000+1000000)}`;
    setSaving(true);
    editItem ? await update(editItem.id,form) : await add({...form,contractId});
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete contract "${item.subject}"?`)) return;
    await remove(item.id);
  };

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Contracts" count={contracts.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search contracts…" />
        <Button onClick={openAdd}>+ Add Contract</Button>
      </PageHeader>
      <DataTable columns={['Contract ID','Subject','Customer','Value','Type','Start','End','Status','Actions']}
        data={filtered} emptyIcon="📄" emptyTitle="No contracts yet" emptySubtitle="Create contracts to track client agreements." onAdd={openAdd} addLabel="Add Contract"
        renderRow={c=>(
          <TR key={c.id}>
            <TD style={{color:T.text.muted,fontFamily:'monospace',fontSize:11}}>{c.contractId}</TD>
            <TD><strong>{c.subject}</strong></TD>
            <TD style={{color:T.text.muted}}>{c.customer||'—'}</TD>
            <TD style={{color:T.status.success,fontWeight:600}}>{formatMoney(c.value)}</TD>
            <TD><Badge>{c.type}</Badge></TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(c.startDate)}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(c.endDate)}</TD>
            <TD><Badge>{c.status||'Active'}</Badge></TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(c)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(c)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />
      {modal && (
        <Modal title={editItem?'Edit Contract':'New Contract'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Contract'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Subject *"         value={form.subject}     onChange={setField('subject')}     placeholder="e.g. Website Development Agreement" error={errors.subject} />
            <Select label="Customer"         value={form.customer}    onChange={setField('customer')}>
              <option value="">Select customer</option>
              {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              {contacts.map(c=><option key={c.id}  value={c.name}>{c.name}</option>)}
            </Select>
            <Input label="Contract Value ($)" value={form.value}      onChange={setField('value')}       placeholder="0" type="number" />
            <Select label="Contract Type"    value={form.type}        onChange={setField('type')}>
              {OPTIONS.contractTypes.map(t=><option key={t}>{t}</option>)}
            </Select>
            <Input label="Start Date"        value={form.startDate}   onChange={setField('startDate')}   type="date" />
            <Input label="End Date"          value={form.endDate}     onChange={setField('endDate')}     type="date" />
            <Select label="Status"           value={form.status}      onChange={setField('status')}>
              {OPTIONS.contractStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <div style={{gridColumn:'1/-1'}}>
              <Textarea label="Description" value={form.description} onChange={setField('description')} placeholder="Contract details…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ContractsPage;
