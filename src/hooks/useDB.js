// =============================================================================
// src/hooks/useDB.js
// =============================================================================
// 🪝 useDB HOOK — Reusable hook for loading and managing any data entity.
//
// USAGE IN A PAGE:
//   const {
//     items,       ← array of records
//     loading,     ← true while loading from storage
//     add,         ← add(data)    → saves & updates state
//     update,      ← update(id, data) → updates & saves
//     remove,      ← remove(id)   → deletes & updates state
//   } = useDB(DB_KEYS.CONTACTS);
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import { generateId } from '../utils/formatters';

function useDB(prefix) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all records on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await storage.getAll(prefix);
      setItems(data);
      setLoading(false);
    })();
  }, [prefix]);

  /**
   * Add a new record.
   * Automatically adds: id, createdAt
   */
  const add = useCallback(async (data) => {
    const newItem = {
      ...data,
      id:        generateId(),
      createdAt: new Date().toISOString(),
    };
    const key = `${prefix}${newItem.id}`;
    await storage.save(key, newItem);
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, [prefix]);

  /**
   * Update an existing record by id.
   * Automatically adds: updatedAt
   */
  const update = useCallback(async (id, data) => {
    const existing = items.find(i => i.id === id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    const key = `${prefix}${id}`;
    await storage.save(key, updated);
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  }, [prefix, items]);

  /**
   * Delete a record by id.
   */
  const remove = useCallback(async (id) => {
    const key = `${prefix}${id}`;
    await storage.remove(key);
    setItems(prev => prev.filter(i => i.id !== id));
  }, [prefix]);

  return { items, loading, add, update, remove, setItems };
}

export default useDB;
