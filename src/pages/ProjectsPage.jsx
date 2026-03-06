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
const DEFAULT_FORM = { name: '', clientId: '', status: '', deadline: '', budget: '', notes: '' };

function ProjectsPage({ companies = [] }) {
  const { items: projects, loading, add, update, remove } = useDB(DB_KEYS.PROJECTS);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() =>
    projects.filter(p => [p.name, p.status].some(v => v?.toLowerCase().includes(search.toLowerCase()))),
    [projects, search]
  );

  const setField = k => e => { setForm(p => ({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e = {}; 
    const ne = required(form.name, 'Project name'); if(ne) e.name=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    
    setSaving(true);
    editItem ? await update(editItem.id, form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete project "${item.name}"?`)) return;
    await remove(item.id);
  };

  // Helper to fetch company name from companies list
  const getClientName = id => companies.find(c => c.id === id)?.name || 'Unknown Client';

  const statusColors = {
    'Planning': T.brand.indigo,
    'Active': T.brand.emerald,
    'On Hold': T.brand.orange,
    'Completed': T.text.muted,
    'Cancelled': T.brand.pink,
  };

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Projects" count={projects.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects…" />
        <Button onClick={openAdd}>+ New Project</Button>
      </PageHeader>
      
      <DataTable columns={['Project Name', 'Client/Company', 'Status', 'Budget', 'Deadline', 'Added', 'Actions']}
        data={filtered} emptyIcon="🏗️" emptyTitle="No projects yet" emptySubtitle="Track ongoing work and deliverables." onAdd={openAdd} addLabel="New Project"
        renderRow={p => (
          <TR key={p.id}>
            <TD><strong>{p.name}</strong></TD>
            <TD>{p.clientId ? getClientName(p.clientId) : '—'}</TD>
            <TD>
              {p.status ? <Badge color={statusColors[p.status]}>{p.status}</Badge> : '—'}
            </TD>
            <TD style={{fontWeight:600}}>${p.budget||'0.00'}</TD>
            <TD style={{color:T.text.muted}}>{p.deadline || '—'}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(p.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(p)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(p)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />
      
      {modal && (
        <Modal title={editItem?'Edit Project':'New Project'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Project'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Project Name *" value={form.name} onChange={setField('name')} placeholder="Website Redesign" error={errors.name} />
            <Select label="Client / Company" value={form.clientId} onChange={setField('clientId')}>
              <option value="">Internal/None</option>
              {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            
            <Select label="Status" value={form.status} onChange={setField('status')}>
              <option value="">Select…</option>
              {OPTIONS.projectStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Input label="Deadline" value={form.deadline} onChange={setField('deadline')} type="date" />
            
            <Input label="Budget ($)" value={form.budget} onChange={setField('budget')} placeholder="5000" type="number" />
            <div style={{gridColumn:'1/-1'}}>
              <Input label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Project requirements and objectives" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProjectsPage;
