// src/pages/hrm/RecruitmentPage.jsx
import React, { useState } from 'react';
import theme from '../../config/theme';
import { DB_KEYS, OPTIONS } from '../../config/db';
import useDB from '../../hooks/useDB';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import { Input, Select, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const T = theme;
const DEFAULT_FORM = { title: '', department: '', description: '', status: 'Open', postedDate: new Date().toISOString() };

export default function RecruitmentPage() {
  const { items: jobs, loading, add, remove } = useDB(DB_KEYS.JOBS);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!form.title || !form.department) return alert('Title and Department are required');
    setSaving(true);
    try {
      await add(form);
      setModal(false);
      setForm(DEFAULT_FORM);
    } catch (err) {
      alert('Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  const setField = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <PageHeader 
        title="Recruitment (ATS)" 
        subtitle="Manage job postings and applicant tracking" 
        right={<Button onClick={() => setModal(true)}>Post Job</Button>}
      />

      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 16 }}>Active Job Openings ({jobs.length})</h3>
        </div>
        
        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: T.text.muted }}>Loading job postings...</div>
          ) : jobs.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: T.text.muted }}>No job postings yet. Click "Post Job" to begin.</div>
          ) : jobs.map(job => (
            <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${T.border.lightAlpha}` }}>
              <div>
                <div style={{ fontWeight: 800 }}>{job.title}</div>
                <div style={{ fontSize: 12, color: T.text.muted }}>{job.department} • Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button size="sm" variant="ghost">View Pipeline →</Button>
                <Button size="sm" variant="danger" onClick={() => remove(job.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <Modal 
          title="Post New Job Opening" 
          onClose={() => setModal(false)} 
          onSave={handleSave}
          saveLabel={saving ? 'Posting...' : 'Post Job'}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Job Title *" value={form.title} onChange={setField('title')} placeholder="e.g. Senior React Developer" />
            <Select label="Department *" value={form.department} onChange={setField('department')}>
              <option value="">Select Dept...</option>
              {OPTIONS.departments.map(d => <option key={d}>{d}</option>)}
            </Select>
            <Textarea label="Job Description" value={form.description} onChange={setField('description')} placeholder="Detail the requirements and responsibilities..." />
            <Select label="Status" value={form.status} onChange={setField('status')}>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </Select>
          </div>
        </Modal>
      )}
    </div>
  );
}
