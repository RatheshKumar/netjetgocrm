// =============================================================================
// src/pages/TasksPage.jsx
// =============================================================================
import React, { useState, useMemo } from 'react';
import theme from '../config/theme';
import { DB_KEYS, OPTIONS } from '../config/db';
import useDB from '../hooks/useDB';
import { Input, Select, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';
import { required } from '../utils/validators';

const T = theme;
const DEFAULT_FORM = { title:'', description:'', status:'Todo', priority:'Medium', assignee:'', dueDate:'' };

function TasksPage() {
  const { items: tasks, loading: tasksLoading, add, update, remove } = useDB(DB_KEYS.TASKS);
  const { items: contacts } = useDB(DB_KEYS.CONTACTS);
  
  const loading = tasksLoading;
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('All');
  const [modal, setModal]         = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [form, setForm]           = useState(DEFAULT_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  const filtered = useMemo(() => tasks.filter(t => {
    const ms = t.title?.toLowerCase().includes(search.toLowerCase());
    const mf = filter==='All' || t.status===filter;
    return ms && mf;
  }), [tasks, search, filter]);

  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e={}; const te=required(form.title,'Title'); if(te) e.title=te;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    editItem ? await update(editItem.id,form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm('Delete this task?')) return;
    await remove(item.id);
  };

  const toggleComplete = async task => {
    const next = task.status==='Completed' ? 'In Progress' : 'Completed';
    await update(task.id,{ status: next });
  };

  const openCount = tasks.filter(t=>t.status!=='Completed').length;

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Tasks" count={openCount}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks…" />
        <Button onClick={openAdd}>+ Add Task</Button>
      </PageHeader>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:7,marginBottom:16,flexWrap:'wrap'}}>
        {['All',...OPTIONS.taskStatuses].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            border:`1.5px solid ${filter===s?T.brand.indigo:T.border.light}`,
            background: filter===s ? T.brand.indigoLight : '#fff',
            color: filter===s ? T.brand.indigo : T.text.muted,
          }}>{s}</button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div style={{background:T.surface.card,border:`1px solid ${T.border.light}`,borderRadius:T.radius.lg}}>
          <EmptyState icon="✅" title="No tasks here" subtitle="Add tasks to track your work and deadlines." action={<Button onClick={openAdd}>+ Add Task</Button>} />
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {filtered.map(task => (
            <div key={task.id} style={{background:T.surface.card,border:`1px solid ${T.border.light}`,borderRadius:T.radius.lg,padding:'14px 16px',display:'flex',alignItems:'flex-start',gap:13,opacity:task.status==='Completed'?0.6:1,transition:'opacity 0.2s'}}>

              {/* Checkbox toggle */}
              <button onClick={()=>toggleComplete(task)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${task.status==='Completed'?T.status.success:T.border.medium}`,background:task.status==='Completed'?T.status.success:'transparent',cursor:'pointer',flexShrink:0,marginTop:2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',transition:'all 0.15s'}}>
                {task.status==='Completed'?'✓':''}
              </button>

              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                  <span style={{fontWeight:700,fontSize:14,color:T.text.primary,textDecoration:task.status==='Completed'?'line-through':'none'}}>{task.title}</span>
                  <Badge>{task.priority}</Badge>
                  <Badge>{task.status}</Badge>
                </div>
                {task.description && <p style={{margin:0,fontSize:13,color:T.text.muted,lineHeight:1.55}}>{task.description}</p>}
                <div style={{display:'flex',gap:14,marginTop:5,fontSize:11,color:T.text.subtle}}>
                  {task.assignee && <span>👤 {task.assignee}</span>}
                  {task.dueDate  && <span>📅 Due {formatDate(task.dueDate)}</span>}
                </div>
              </div>

              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <Button size="sm" variant="ghost"    onClick={()=>openEdit(task)}>Edit</Button>
                <Button size="sm" variant="danger"   onClick={()=>handleDelete(task)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={editItem?'Edit Task':'New Task'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Task'} wide>
          <Input label="Task Title *" value={form.title} onChange={setField('title')} placeholder="What needs to be done?" error={errors.title} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Select label="Status"   value={form.status}   onChange={setField('status')}>
              {OPTIONS.taskStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={setField('priority')}>
              {OPTIONS.taskPriorities.map(p=><option key={p}>{p}</option>)}
            </Select>
            <Select label="Assignee" value={form.assignee} onChange={setField('assignee')}>
              <option value="">Unassigned</option>
              {contacts.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
            <Input label="Due Date"  value={form.dueDate}  onChange={setField('dueDate')} type="date" />
          </div>
          <Textarea label="Description" value={form.description} onChange={setField('description')} placeholder="Task details and context…" />
        </Modal>
      )}
    </div>
  );
}

export default TasksPage;
