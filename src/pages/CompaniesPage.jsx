// =============================================================================
// src/pages/CompaniesPage.jsx
// =============================================================================
import React, { useState, useMemo } from 'react';
import theme from '../config/theme';
import { DB_KEYS, OPTIONS } from '../config/db';
import useDB from '../hooks/useDB';
import DataTable, { TR, TD } from '../components/ui/DataTable';
import { Input, Select } from "../components/ui/Input";
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDate } from '../utils/formatters';
import { required } from '../utils/validators';

const T = theme;
const DEFAULT_FORM = { name:'', website:'', industry:'', address:'', phone:'', email:'', size:'' };

function CompaniesPage() {
  const { items: companies, loading, add, update, remove } = useDB(DB_KEYS.COMPANIES);
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() =>
    companies.filter(c => [c.name, c.industry, c.website].some(v => v?.toLowerCase().includes(search.toLowerCase()))),
    [companies, search]
  );

  const setField = k => e => { setForm(p => ({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e = {}; const ne = required(form.name,'Company name'); if(ne) e.name=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    editItem ? await update(editItem.id, form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete "${item.name}"?`)) return;
    await remove(item.id);
  };

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Companies" count={companies.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search companies…" />
        <Button onClick={openAdd}>+ Add Company</Button>
      </PageHeader>
      <DataTable columns={['Name','Industry','Website','Email','Phone','Size','Added','Actions']}
        data={filtered} emptyIcon="🏢" emptyTitle="No companies yet" emptySubtitle="Add companies to link with contacts and leads." onAdd={openAdd} addLabel="Add Company"
        renderRow={c => (
          <TR key={c.id}>
            <TD><strong>{c.name}</strong></TD>
            <TD>{c.industry ? <Badge>{c.industry}</Badge> : '—'}</TD>
            <TD style={{color:T.brand.indigo,fontSize:12}}>{c.website||'—'}</TD>
            <TD style={{color:T.text.muted}}>{c.email||'—'}</TD>
            <TD style={{color:T.text.muted,fontFamily:'monospace',fontSize:12}}>{c.phone||'—'}</TD>
            <TD style={{color:T.text.muted}}>{c.size||'—'}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(c.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(c)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(c)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />
      {modal && (
        <Modal title={editItem?'Edit Company':'New Company'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Company'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Company Name *" value={form.name}    onChange={setField('name')}    placeholder="Acme Corp"       error={errors.name} />
            <Select label="Industry"      value={form.industry} onChange={setField('industry')}>
              <option value="">Select…</option>
              {OPTIONS.industries.map(i=><option key={i}>{i}</option>)}
            </Select>
            <Input label="Website"  value={form.website} onChange={setField('website')} placeholder="https://company.com" />
            <Input label="Email"    value={form.email}   onChange={setField('email')}   placeholder="info@company.com" type="email" />
            <Input label="Phone"    value={form.phone}   onChange={setField('phone')}   placeholder="+1 800 000 0000" />
            <Select label="Company Size" value={form.size} onChange={setField('size')}>
              <option value="">Select…</option>
              {OPTIONS.companySizes.map(s=><option key={s}>{s}</option>)}
            </Select>
            <div style={{gridColumn:'1/-1'}}>
              <Input label="Address" value={form.address} onChange={setField('address')} placeholder="123 Main St, City, Country" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CompaniesPage;
