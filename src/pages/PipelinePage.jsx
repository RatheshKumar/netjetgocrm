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
const DEFAULT_FORM = { name:'', totalValue:'', deals:'', stage:'Prospecting', status:'Active', notes:'', assignedTo:'' };
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

function PipelinePage() {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState({ ...DEFAULT_FORM, assignedTo: user?.name || '' });
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);

  const isAdmin = ['Admin', 'CEO / Founder'].includes(user?.role);
  const canEdit = isAdmin || ['Sales Representative', 'Project Manager'].includes(user?.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/crm/pipelines`, { headers: authHeader() });
      const data = await res.json();
      setPipelines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pipelines:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() =>
    pipelines.filter(p=>[p.name,p.stage].some(v=>v?.toLowerCase().includes(search.toLowerCase()))),
    [pipelines,search]
  );

  const totalValue = pipelines.reduce((s,p)=>s+(Number(p.totalValue)||0),0);
  const setField = k => e => { setForm(p=>({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd  = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e={}; const ne=required(form.name,'Pipeline name'); if(ne) e.name=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    setSaving(true);
    try {
      const url = editItem ? `${API_BASE}/api/crm/pipelines/${editItem.id}` : `${API_BASE}/api/crm/pipelines`;
      const method = editItem ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(form)
      });
      setModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save pipeline');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete pipeline "${item.name}"?`)) return;
    await fetch(`${API_BASE}/api/crm/pipelines/${item.id}`, { method: 'DELETE', headers: authHeader() });
    fetchData();
  };

  if(loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Pipeline" count={pipelines.length}>
        <span style={{fontSize:13,color:T.text.muted}}>Total: <strong style={{color:T.status.success}}>{formatMoneyCompact(totalValue)}</strong></span>
        <SearchBar value={search} onChange={setSearch} placeholder="Search pipeline…" />
        <Button onClick={openAdd}>+ Add Pipeline</Button>
      </PageHeader>
      <DataTable columns={['Pipeline','Total Value','Deals','Stage','Status','Created','Actions']}
        data={filtered} emptyIcon="🔀" emptyTitle="No pipelines yet" emptySubtitle="Create pipelines to track your sales stages." onAdd={openAdd} addLabel="Add Pipeline"
        renderRow={p=>(
          <TR key={p.id}>
            <TD><strong>{p.name}</strong></TD>
            <TD style={{color:T.status.success,fontWeight:600}}>{formatMoney(p.totalValue)}</TD>
            <TD style={{fontFamily:'monospace',fontWeight:700,fontSize:15}}>{p.deals||0}</TD>
            <TD><Badge>{p.stage}</Badge></TD>
            <TD><Badge>{p.status||'Active'}</Badge></TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(p.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              {canEdit && <Button size="sm" variant="secondary" onClick={()=>openEdit(p)}>Edit</Button>}
              {canEdit && <Button size="sm" variant="danger"    onClick={()=>handleDelete(p)}>Delete</Button>}
            </div></TD>
          </TR>
        )}
      />
      {modal && (
        <Modal title={editItem?'Edit Pipeline':'New Pipeline'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Pipeline'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Pipeline Name *"     value={form.name}       onChange={setField('name')}       placeholder="e.g. Q2 Enterprise Sales" error={errors.name} />
            <Input label="Total Deal Value ($)" value={form.totalValue} onChange={setField('totalValue')} placeholder="0" type="number" />
            <Input label="Number of Deals"     value={form.deals}      onChange={setField('deals')}      placeholder="0" type="number" />
            <Select label="Stage"              value={form.stage}      onChange={setField('stage')}>
              {OPTIONS.pipelineStages.map(s=><option key={s}>{s}</option>)}
            </Select>
            <Select label="Status"             value={form.status}     onChange={setField('status')}>
              {OPTIONS.pipelineStatuses.map(s=><option key={s}>{s}</option>)}
            </Select>
            <div style={{gridColumn:'1/-1'}}>
              <Textarea label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Pipeline notes…" />
            </div>
            <Input label="Assigned To" value={form.assignedTo} onChange={setField('assignedTo')} placeholder="Owner Name" disabled={!isAdmin} />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PipelinePage;
