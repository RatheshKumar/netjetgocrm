// =============================================================================
// src/context/AuthContext.jsx
// =============================================================================
// 🔐 AUTH CONTEXT — Manages CRM and ERP user sessions separately.
//
// CRM:  user, login(), signup(), logout()
// ERP:  erpUser, erpLogin(), erpSignup(), erpLogout()
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { DB_KEYS } from '../config/db';

const AuthContext = createContext(null);
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [erpUser, setErpUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: restore session from storage
  useEffect(() => {
    (async () => {
      const session = await storage.get(DB_KEYS.SESSION);
      if (session?.token && session?.user) {
        setUser(session.user);
        setErpUser(session.user); // Unified session
      }
      setLoading(false);
    })();
  }, []);

  // ── Unified Login ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok) return { ok: false, error: result.error || 'Login failed' };

      // Save token and user info
      await storage.save(DB_KEYS.SESSION, { token: result.token, user: result.user });
      setUser(result.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Cannot connect to server.' };
    }
  };

  // ERP Login now uses the same unified auth system
  const erpLogin = async (email, password) => {
    const res = await login(email, password);
    if (res.ok) setErpUser(user); // Map to erpUser for backward compatibility if needed
    return res;
  };

  // ── Unified Signup (via HRM module) ─────────────────────────────────────────────
  const signup = async (data) => {
    try {
      const response = await fetch(`${API_BASE}/api/hrm/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) return { ok: false, error: result.error || 'Signup failed' };
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Cannot connect to server.' };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await storage.remove(DB_KEYS.SESSION);
    setUser(null);
    setErpUser(null);
  };

  const erpLogout = logout;

  return (
    <AuthContext.Provider value={{ user, erpUser, loading, login, signup, logout, erpLogin, erpLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
