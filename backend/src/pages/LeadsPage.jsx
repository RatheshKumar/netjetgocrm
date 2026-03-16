// =============================================================================
// src/pages/LeadsPage.jsx
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
const DEFAULT_FORM = { name:'', company:'', email:'', phone:'', status:'Pending', value:'', owner:'', source:'', notes:'' };

function LeadsPage({ companies }) {
  const { items: leads, loading, add, update, remove } = useDB(DB_KEYS.LEADS);
  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('All');
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  const filtered = useMemo(() => leads.filter(l => {
    const ms = [l.name,l.company,l.email,l.owner].some(v=>v?.toLowerCase().includes(search.toLowerCase()));
    const mf = statusFilter==='All' || l.status===statusFilter;
    return ms && mf;
  }), [leads, search, statusFilter]);

  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e={}; const ne=required(form.name,'Lead name'); if(ne) e.name=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    editItem ? await update(editItem.id, form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete lead "${item.name}"?`)) return;
    await remove(item.id);
  };

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Leads" count={leads.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search leads…" />
        <Button onClick={openAdd}>+ Add Lead</Button>
      </PageHeader>

      {/* Status filter tabs */}
      <div style={{display:'flex',gap:7,marginBottom:16,flexWrap:'wrap'}}>
        {['All',...OPTIONS.leadStatuses].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            border:`1.5px solid ${statusFilter===s?T.brand.indigo:T.border.light}`,
            background: statusFilter===s ? T.brand.indigoLight : '#fff',
            color: statusFilter===s ? T.brand.indigo : T.text.muted,
          }}>{s}</button>
        ))}
      </div>

      <DataTable columns={['Lead Name','Company','Email','Status','Value','Owner','Created','Actions']}
        data={filtered} emptyIcon="📈" emptyTitle="No leads yet" emptySubtitle="Track your sales opportunities here." onAdd={openAdd} addLabel="Add Lead"
        renderRow={l => (
          <TR key={l.id}>
            <TD><strong>{l.name}</strong></TD>
            <TD style={{color:T.text.muted}}>{l.company||'—'}</TD>
            <TD style={{color:T.text.muted}}>{l.email||'—'}</TD>
            <TD><Badge>{l.status}</Badge></TD>
            <TD style={{color:T.status.success,fontWeight:600}}>{formatMoney(l.value)}</TD>
            <TD style={{color:T.text.muted}}>{l.owner||'—'}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(l.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(l)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(l)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />

      {modal && (
        <Modal title={editItem?'Edit Lead':'New Lead'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Lead'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Lead Name *" value={form.name}  onChange={setField('name')}  placeholder="Deal or opportunity name" error={errors.name} />
            <Select label="Company"    value={form.company} onChange={setField('company')}>
              <option value="">No company</option>
              {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
            <Input label="Email"       value={form.email}  onChange={setField('email')}  placeholder="lead@company.com" type="email" />
            <Input label="Phone"       value={form.phone}  onChange={setField('phone')}  placeholder="+1 234 567 8900" />
            <Select label="Status"     value={form.status} onChange={setField('status')}>
              {OPTIONS.leadStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Input label="Deal Value ($)" value={form.value} onChange={setField('value')} placeholder="0" type="number" />
            <Input label="Lead Owner"  value={form.owner}  onChange={setField('owner')}  placeholder="Assigned to" />
            <Select label="Source"     value={form.source} onChange={setField('source')}>
              <option value="">Select source</option>
              {OPTIONS.leadSources.map(s=><option key={s}>{s}</option>)}
            </Select>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Lead context and notes…" />
        </Modal>
      )}
    </div>
  );
}

export default LeadsPage;
