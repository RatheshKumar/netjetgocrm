// src/pages/UserManagementPage.jsx
import React, { useState, useEffect } from 'react';
import theme from '../config/theme';
import PageHeader from '../components/ui/PageHeader';

const T = theme;

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/users`)
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  }, []);

  const roles = [
    'Admin', 'CEO / Founder', 'HR Manager', 'Sales Representative', 
    'Marketing Specialist', 'Accountant', 'Support Agent', 'Project Manager', 
    'Regular Employee'
  ];

  const updateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        alert(`Role updated to ${newRole} for user ID ${userId}`);
      }
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="CEO Dashboard: Assign and approve user roles" />
      <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: T.surface.sidebarAlpha, textAlign: 'left' }}>
              <th style={{ padding: 16, fontSize: 12, fontWeight: 800 }}>User Name</th>
              <th style={{ padding: 16, fontSize: 12, fontWeight: 800 }}>Email</th>
              <th style={{ padding: 16, fontSize: 12, fontWeight: 800 }}>Current Role</th>
              <th style={{ padding: 16, fontSize: 12, fontWeight: 800 }}>Assign New Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${T.border.light}` }}>
                <td style={{ padding: 16, fontSize: 14 }}>{u.name}</td>
                <td style={{ padding: 16, fontSize: 14, color: T.text.muted }}>{u.email}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: u.role === 'Pending' ? T.status.warningAlpha : T.brand.indigoAlpha,
                    color: u.role === 'Pending' ? T.status.warning : T.brand.indigo
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: 16 }}>
                  <select 
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: T.radius.md, border: `1px solid ${T.border.light}`, fontSize: 12 }}
                  >
                    <option disabled value="Pending">Assign Role...</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
