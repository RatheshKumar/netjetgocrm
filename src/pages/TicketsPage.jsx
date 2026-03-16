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
const DEFAULT_FORM = { subject: '', contactId: '', priority: '', status: '', description: '' };

function TicketsPage({ contacts = [] }) {
  const { items: tickets, loading, add, update, remove } = useDB(DB_KEYS.TICKETS);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() =>
    tickets.filter(t => [t.subject, t.status].some(v => v?.toLowerCase().includes(search.toLowerCase()))),
    [tickets, search]
  );

  const setField = k => e => { setForm(p => ({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e = {}; 
    const ne = required(form.subject, 'Subject'); if(ne) e.subject=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    
    setSaving(true);
    editItem ? await update(editItem.id, form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete ticket "${item.subject}"?`)) return;
    await remove(item.id);
  };

  const getContactName = id => contacts.find(c => c.id === id)?.name || 'Unknown Contact';

  const statusColors = {
    'Open': T.brand.indigo,
    'In Progress': T.brand.orange,
    'Waiting on Customer': T.brand.purple,
    'Resolved': T.brand.emerald,
    'Closed': T.text.muted,
  };

  const priorityColors = {
    'Low': T.text.muted,
    'Normal': T.brand.indigo,
    'High': T.brand.orange,
    'Urgent': T.brand.pink,
  };

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Support Tickets" count={tickets.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search tickets…" />
        <Button onClick={openAdd}>+ New Ticket</Button>
      </PageHeader>
      
      <DataTable columns={['Subject', 'Contact', 'Status', 'Priority', 'Created', 'Actions']}
        data={filtered} emptyIcon="🎫" emptyTitle="No tickets yet" emptySubtitle="Track customer issues and support requests." onAdd={openAdd} addLabel="New Ticket"
        renderRow={t => (
          <TR key={t.id}>
            <TD><strong>{t.subject}</strong></TD>
            <TD>{t.contactId ? getContactName(t.contactId) : '—'}</TD>
            <TD>
              {t.status ? <Badge color={statusColors[t.status]}>{t.status}</Badge> : '—'}
            </TD>
            <TD>
              {t.priority ? <Badge color={priorityColors[t.priority]}>{t.priority}</Badge> : '—'}
            </TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(t.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(t)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(t)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />
      
      {modal && (
        <Modal title={editItem?'Edit Ticket':'New Ticket'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Ticket'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <div style={{gridColumn:'1/-1'}}>
              <Input label="Subject *" value={form.subject} onChange={setField('subject')} placeholder="Login issue on portal" error={errors.subject} />
            </div>
            
            <Select label="Contact / Submitter" value={form.contactId} onChange={setField('contactId')}>
              <option value="">Internal/None</option>
              {contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div /> {/* Spacer */}
            
            <Select label="Status" value={form.status} onChange={setField('status')}>
              <option value="">Select…</option>
              {OPTIONS.ticketStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={setField('priority')}>
              <option value="">Select…</option>
              {OPTIONS.ticketPriorities.map(p=><option key={p}>{p}</option>)}
            </Select>
            
            <div style={{gridColumn:'1/-1'}}>
              <Input label="Description" value={form.description} onChange={setField('description')} placeholder="Detailed summary of the customer's problem..." />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default TicketsPage;
