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

// Map of storage key prefixes → REST base paths
const REST_MAP = {
  'contacts:':   '/api/contacts',
  'leads:':      '/api/leads',
  'companies:':  '/api/companies',
  'users:':      '/api/users',
};

function getEndpoint(key) {
  const prefix = Object.keys(REST_MAP).find(p => key.startsWith(p));
  if (!prefix) return null;
  const id = key.slice(prefix.length);
  return { base: REST_MAP[prefix], id };
}

const storage = {
  /**
   * Get a single record by its full key (e.g. "contacts:abc123")
   * Returns the object, or null if not found.
   */
  async get(key) {
    try {
      const ep = getEndpoint(key);
      if (!ep) {
        // generic fallback
        const r = await fetch(`/api/storage/${key}`);
        if (!r.ok) return null;
        const data = await r.json();
        return data ? (data.value ? JSON.parse(data.value) : data) : null;
      }
      const r = await fetch(`${ep.base}/${ep.id}`);
      if (!r.ok) return null;
      return await r.json();
    } catch (err) {
      console.warn(`[storage.get] Failed for "${key}":`, err);
      return null;
    }
  },

  /**
   * Save (create or update) a record.
   * @param {string} key  - "contacts:abc123"
   * @param {object} data - The data object to save
   */
  async save(key, data) {
    try {
      const ep = getEndpoint(key);
      if (!ep) {
        // generic fallback
        const r = await fetch(`/api/storage/${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        return r.ok;
      }

      // Try PUT first (update), fallback to POST (create)
      const putRes = await fetch(`${ep.base}/${ep.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!putRes.ok) {
        // Record may not exist yet → create it
        const postRes = await fetch(ep.base, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, id: ep.id }),
        });
        return postRes.ok;
      }

      return putRes.ok;
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
      const ep = getEndpoint(key);
      if (!ep) {
        const r = await fetch(`/api/storage/${key}`, { method: 'DELETE' });
        return r.ok;
      }
      const r = await fetch(`${ep.base}/${ep.id}`, { method: 'DELETE' });
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
      const base = REST_MAP[prefix];

      if (base) {
        const r = await fetch(base);
        if (!r.ok) return [];
        const data = await r.json();
        return Array.isArray(data) ? data : [];
      }

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
