// src/utils/api.js — Shared API utilities
// Centralizes auth header generation and API base URL.
// All pages should import from here instead of defining their own authHeader().

const SESSION_KEY = 'session:current'; // Must match AuthContext.jsx

export const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

/**
 * Returns auth headers with Bearer token for API requests.
 * Includes Content-Type: application/json by default.
 */
export function authHeader() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return {
      'Authorization': `Bearer ${session?.token || ''}`,
      'Content-Type': 'application/json',
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}
