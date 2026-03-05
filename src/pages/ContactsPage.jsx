// =============================================================================
// src/pages/ContactsPage.jsx
// =============================================================================
// 👤 CONTACTS PAGE
//
// ✏️  HOW TO ADD / REMOVE FORM FIELDS:
//   1. Add/remove from FORM_FIELDS array below
//   2. Add/remove from DEFAULT_FORM below
//   3. Add/remove the matching <Input> or <Select> in the modal section
//
// ✏️  HOW TO ADD A NEW COLUMN TO THE TABLE:
//   1. Add the column header to TABLE_COLUMNS
//   2. Add a matching <TD> inside renderRow()
// =============================================================================

import React, { useState, useMemo } from 'react';
import theme      from '../config/theme';
import { DB_KEYS } from '../config/db';
import useDB      from '../hooks/useDB';
import DataTable, { TR, TD } from '../components/ui/DataTable';
import { Input, Select } from '../components/ui/Input';
import Button     from '../components/ui/Button';
import Modal      from '../components/ui/Modal';
import Badge      from '../components/ui/Badge';
import SearchBar  from '../components/ui/SearchBar';
import PageHeader from '../components/ui/PageHeader';
import { formatDate } from '../utils/formatters';
import { required, validEmail } from '../utils/validators';

const T = theme;

// ── Table columns ─────────────────────────────────────────────────────────────
const TABLE_COLUMNS = ['Name', 'Email', 'Job Title', 'Company', 'Phone', 'Date Added', 'Actions'];

// ── Default empty form (add fields here) ─────────────────────────────────────
const DEFAULT_FORM = {
  name:     '',
  email:    '',
  phone:    '',
  jobTitle: '',
  company:  '',
  notes:    '',
};

// ── Validation rules ──────────────────────────────────────────────────────────
function validateForm(form) {
  const errors = {};
  const nameErr  = required(form.name, 'Name');
  if (nameErr) errors.name = nameErr;
  if (form.email) {
    const emailErr = validEmail(form.email);
    if (emailErr) errors.email = emailErr;
  }
  return errors;
}

function ContactsPage({ companies }) {
  const { items: contacts, loading, add, update, remove } = useDB(DB_KEYS.CONTACTS);

  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null); // null = adding new
  const [form,     setForm]     = useState(DEFAULT_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    contacts.filter(c =>
      [c.name, c.email, c.company, c.jobTitle, c.phone]
        .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    ),
    [contacts, search]
  );

  // ── Open modal ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setEditItem(null);
    setErrors({});
    setModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...DEFAULT_FORM, ...item });
    setEditItem(item);
    setErrors({});
    setModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setSaving(true);
    if (editItem) {
      await update(editItem.id, form);
    } else {
      await add(form);
    }
    setSaving(false);
    setModal(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete contact "${item.name}"? This cannot be undone.`)) return;
    await remove(item.id);
  };

  // ── Field change helper ───────────────────────────────────────────────────
  const setField = key => e => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  if (loading) return <div style={{ padding: 40, color: T.text.muted }}>Loading contacts…</div>;

  return (
    <div>
      <PageHeader title="Contacts" count={contacts.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search contacts…" />
        <Button onClick={openAdd}>+ Add Contact</Button>
      </PageHeader>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <DataTable
        columns={TABLE_COLUMNS}
        data={filtered}
        emptyIcon="👤"
        emptyTitle="No contacts yet"
        emptySubtitle="Add your first contact to start building your network."
        onAdd={openAdd}
        addLabel="Add Contact"
        renderRow={(c) => (
          <TR key={c.id}>
            <TD><strong>{c.name}</strong></TD>
            <TD style={{ color: T.text.muted }}>{c.email || '—'}</TD>
            <TD style={{ color: T.text.muted }}>{c.jobTitle || '—'}</TD>
            <TD>{c.company ? <Badge>{c.company}</Badge> : '—'}</TD>
            <TD style={{ color: T.text.muted, fontFamily: 'monospace', fontSize: 12 }}>{c.phone || '—'}</TD>
            <TD style={{ color: T.text.muted, fontSize: 12 }}>{formatDate(c.createdAt)}</TD>
            <TD>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
                <Button size="sm" variant="danger"    onClick={() => handleDelete(c)}>Delete</Button>
              </div>
            </TD>
          </TR>
        )}
      />

      {/* ── Add / Edit Modal ──────────────────────────────────────────────── */}
      {modal && (
        <Modal
          title={editItem ? 'Edit Contact' : 'New Contact'}
          onClose={() => setModal(false)}
          onSave={handleSave}
          saveLabel={saving ? 'Saving…' : 'Save Contact'}
          wide
        >
          {/* ✏️  ADD / REMOVE FORM FIELDS HERE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Input label="Full Name *"  value={form.name}     onChange={setField('name')}     placeholder="John Smith"          error={errors.name} />
            <Input label="Email"        value={form.email}    onChange={setField('email')}    placeholder="john@company.com" type="email" error={errors.email} />
            <Input label="Phone"        value={form.phone}    onChange={setField('phone')}    placeholder="+1 234 567 8900" />
            <Input label="Job Title"    value={form.jobTitle} onChange={setField('jobTitle')} placeholder="Sales Manager" />
            <div style={{ gridColumn: '1/-1' }}>
              <Select label="Company" value={form.company} onChange={setField('company')}>
                <option value="">No company</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </Select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Textarea label="Notes" value={form.notes} onChange={setField('notes')} placeholder="Any additional notes about this contact…" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ContactsPage;
