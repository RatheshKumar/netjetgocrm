// src/pages/collaboration/TaskAssignmentPage.jsx
import React, { useState } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function TaskAssignmentPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Fix Inventory SKU Mismatch', assignedTo: 'John Doe', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Follow up with Acme Corp', assignedTo: 'Sarah Smith', status: 'Pending', priority: 'Medium' }
  ]);

  const toggleStatus = (id) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const next = t.status === 'Pending' ? 'In Progress' : (t.status === 'In Progress' ? 'Completed' : 'Pending');
        return { ...t, status: next };
      }
      return t;
    }));
  };

  return (
    <div>
      <PageHeader title="Task Board" subtitle="Assign and track tasks across the organization" />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ background: '#fff', padding: 20, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, boxShadow: T.shadow.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: t.priority === 'High' ? T.status.error : T.brand.pink, textTransform: 'uppercase' }}>{t.priority} Priority</span>
              <span style={{ 
                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                background: t.status === 'Completed' ? T.status.successAlpha : T.border.light,
                color: t.status === 'Completed' ? T.status.success : T.text.primary
              }}>{t.status}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{t.title}</h3>
            <div style={{ fontSize: 12, color: T.text.muted }}>Assigned to: <strong>{t.assignedTo}</strong></div>
            <button 
              onClick={() => toggleStatus(t.id)}
              style={{ marginTop: 16, width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${T.brand.indigo}`, color: T.brand.indigo, borderRadius: T.radius.md, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Cycle Status
            </button>
          </div>
        ))}
        
        <div style={{ border: `2px dashed ${T.border.medium}`, borderRadius: T.radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, cursor: 'pointer' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>➕</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text.muted }}>Create New Task</div>
          </div>
        </div>
      </div>
    </div>
  );
}
