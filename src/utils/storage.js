// =============================================================================
// src/utils/storage.js
// =============================================================================
// 🗄 DATABASE HELPERS — Low-level functions to read/write/delete records.
//
// Bridges the old key-prefix pattern ("contacts:id") to the new REST endpoints.
// Prefix → REST endpoint mapping:
//   contacts:  → /api/contacts
//   leads:     → /api/leads
//   companies: → /api/companies
//   users:     → /api/users
//   erp_*      → /api/storage (generic fallback)
//   other      → /api/storage (generic fallback)
// =============================================================================

const storage = {
  /**
   * Get a single record by its full key (e.g. "contacts:abc123")
   * Returns the object, or null if not found.
   */
  async get(key) {
    try {
      const r = await fetch(`/api/storage/${key}`);
      if (!r.ok) return null;
      const data = await r.json();
      // If the value is a stringified JSON (from the SQL storage table), parse it.
      // Otherwise return as is.
      if (data && data.value && typeof data.value === 'string' && (data.value.startsWith('{') || data.value.startsWith('['))) {
        return JSON.parse(data.value);
      }
      return data;
    } catch (err) {
      console.warn(`[storage.get] Failed for "${key}":`, err);
      return null;
    }
  },

  /**
   * Save (create or update) a record.
   */
  async save(key, data) {
    try {
      const r = await fetch(`/api/storage/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return r.ok;
    } catch (err) {
      console.error(`[storage.save] Failed for "${key}":`, err);
      return false;
    }
  },

  /**
   * Delete a record by its full key.
   */
  async remove(key) {
    try {
      const r = await fetch(`/api/storage/${key}`, { method: 'DELETE' });
      return r.ok;
    } catch (err) {
      console.error(`[storage.remove] Failed for "${key}":`, err);
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
      // Generic fallback
      const r = await fetch(`/api/storage?prefix=${prefix}`);
      if (!r.ok) return [];
      const data = await r.json();
      const keys = data.keys || [];
      const items = await Promise.all(keys.map(k => storage.get(k)));
      return items
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      console.error(`[storage.getAll] Failed for "${prefix}":`, err);
      return [];
    }
  },
};

export default storage;
