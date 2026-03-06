// =============================================================================
// src/utils/storage.js
// =============================================================================
// 🗄 DATABASE HELPERS — Low-level functions to read/write/delete records.
//
// All data is persisted using window.storage (survives page refresh).
// You should not need to edit this file. Use these functions in pages/hooks.
//
// USAGE EXAMPLE:
//   import storage from '../utils/storage';
//   const contacts = await storage.getAll('contacts:');
//   await storage.save('contacts:abc123', { name: 'John' });
//   await storage.remove('contacts:abc123');
// =============================================================================

const storage = {
  /**
   * Get a single record by its full key.
   * Returns the parsed object, or null if not found.
   */
  async get(key) {
    try {
      const response = await fetch(`/api/storage/${key}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data ? JSON.parse(data.value) : null;
    } catch (err) {
      console.warn(`[storage.get] Failed for key "${key}":`, err);
      return null;
    }
  },

  /**
   * Save (create or update) a record.
   * @param {string} key  - Full storage key, e.g. "contacts:abc123"
   * @param {object} data - The data object to save
   */
  async save(key, data) {
    try {
      const response = await fetch(`/api/storage/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (err) {
      console.error(`[storage.save] Failed for key "${key}":`, err);
      return false;
    }
  },

  /**
   * Delete a record by its full key.
   */
  async remove(key) {
    try {
      const response = await fetch(`/api/storage/${key}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (err) {
      console.error(`[storage.remove] Failed for key "${key}":`, err);
      return false;
    }
  },

  /**
   * Get ALL records that start with a given prefix.
   * Returns an array of objects, sorted newest first.
   * @param {string} prefix - e.g. "contacts:" or "leads:"
   */
  async getAll(prefix) {
    try {
      const response = await fetch(`/api/storage?prefix=${prefix}`);
      if (!response.ok) return [];
      const data = await response.json();
      const keys = data.keys || [];
      const items = await Promise.all(keys.map(k => storage.get(k)));
      return items
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error(`[storage.getAll] Failed for prefix "${prefix}":`, err);
      return [];
    }
  },
};

export default storage;
