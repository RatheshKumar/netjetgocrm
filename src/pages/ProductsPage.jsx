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
const DEFAULT_FORM = { name: '', sku: '', category: '', price: '', stock: '', description: '' };

function ProductsPage() {
  const { items: products, loading, add, update, remove } = useDB(DB_KEYS.PRODUCTS);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() =>
    products.filter(p => [p.name, p.sku, p.category].some(v => v?.toLowerCase().includes(search.toLowerCase()))),
    [products, search]
  );

  const setField = k => e => { setForm(p => ({...p,[k]:e.target.value})); setErrors(p=>({...p,[k]:''})); };
  const openAdd = () => { setForm(DEFAULT_FORM); setEditItem(null); setErrors({}); setModal(true); };
  const openEdit = item => { setForm({...DEFAULT_FORM,...item}); setEditItem(item); setErrors({}); setModal(true); };

  const handleSave = async () => {
    const e = {}; 
    const ne = required(form.name, 'Product name'); if(ne) e.name=ne;
    if(Object.keys(e).length>0){setErrors(e);return;}
    
    setSaving(true);
    editItem ? await update(editItem.id, form) : await add(form);
    setSaving(false); setModal(false);
  };

  const handleDelete = async item => {
    if(!window.confirm(`Delete product "${item.name}"?`)) return;
    await remove(item.id);
  };

  if (loading) return <div style={{padding:40,color:T.text.muted}}>Loading…</div>;

  return (
    <div>
      <PageHeader title="Products" count={products.length}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
        <Button onClick={openAdd}>+ Add Product</Button>
      </PageHeader>
      
      <DataTable columns={['Product Name', 'SKU', 'Category', 'Price', 'Stock', 'Added', 'Actions']}
        data={filtered} emptyIcon="📦" emptyTitle="No products yet" emptySubtitle="Add products or services your company offers." onAdd={openAdd} addLabel="Add Product"
        renderRow={p => (
          <TR key={p.id}>
            <TD><strong>{p.name}</strong></TD>
            <TD style={{fontFamily:'monospace',color:T.text.muted}}>{p.sku||'—'}</TD>
            <TD>{p.category ? <Badge>{p.category}</Badge> : '—'}</TD>
            <TD style={{color:T.brand.emerald, fontWeight:600}}>${p.price||'0.00'}</TD>
            <TD>{p.stock || '0'}</TD>
            <TD style={{color:T.text.muted,fontSize:12}}>{formatDate(p.createdAt)}</TD>
            <TD><div style={{display:'flex',gap:6}}>
              <Button size="sm" variant="secondary" onClick={()=>openEdit(p)}>Edit</Button>
              <Button size="sm" variant="danger"    onClick={()=>handleDelete(p)}>Delete</Button>
            </div></TD>
          </TR>
        )}
      />
      
      {modal && (
        <Modal title={editItem?'Edit Product':'New Product'} onClose={()=>setModal(false)} onSave={handleSave} saveLabel={saving?'Saving…':'Save Product'} wide>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>
            <Input label="Name *" value={form.name} onChange={setField('name')} placeholder="Ultra Laptop Pro" error={errors.name} />
            <Input label="SKU" value={form.sku} onChange={setField('sku')} placeholder="PRD-1001" />
            
            <Select label="Category" value={form.category} onChange={setField('category')}>
              <option value="">Select…</option>
              {OPTIONS.productCategories.map(c=><option key={c}>{c}</option>)}
            </Select>
            <Input label="Price ($)" value={form.price} onChange={setField('price')} placeholder="99.99" type="number" />
            
            <Input label="Stock Quantity" value={form.stock} onChange={setField('stock')} placeholder="100" type="number" />
            <div style={{gridColumn:'1/-1'}}>
              <Input label="Description" value={form.description} onChange={setField('description')} placeholder="Detailed description of the product/service" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ProductsPage;
