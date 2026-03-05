// =============================================================================
// src/context/AuthContext.jsx
// =============================================================================
// 🔐 AUTH CONTEXT — Manages the logged-in user across the whole app.
//
// Provides: user, loading, login(), signup(), logout()
// Wrap your app with <AuthProvider> (done in index.js already).
// Access anywhere with: const { user, login, logout } = useAuth();
// =============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { generateId, getInitials } from '../utils/formatters';
import { DB_KEYS } from '../config/db';

const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: restore session from storage
  useEffect(() => {
    (async () => {
      const session = await storage.get(DB_KEYS.SESSION);
      if (session?.email) {
        const savedUser = await storage.get(`${DB_KEYS.USERS}${session.email}`);
        if (savedUser) setUser(savedUser);
      }
      setLoading(false);
    })();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const savedUser  = await storage.get(`${DB_KEYS.USERS}${cleanEmail}`);

    if (!savedUser)              return { ok: false, error: 'No account found with this email.' };
    if (savedUser.password !== password) return { ok: false, error: 'Incorrect password.' };

    await storage.save(DB_KEYS.SESSION, { email: cleanEmail, loginAt: new Date().toISOString() });
    setUser(savedUser);
    return { ok: true };
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = async ({ name, email, password, role }) => {
    const cleanEmail = email.toLowerCase().trim();
    const existing   = await storage.get(`${DB_KEYS.USERS}${cleanEmail}`);

    if (existing) return { ok: false, error: 'An account with this email already exists.' };

    const newUser = {
      id:        generateId(),
      name:      name.trim(),
      email:     cleanEmail,
      password,                          // NOTE: In production, hash passwords server-side
      role:      role || 'Sales Rep',
      initials:  getInitials(name),
      createdAt: new Date().toISOString(),
    };

    await storage.save(`${DB_KEYS.USERS}${cleanEmail}`, newUser);
    await storage.save(DB_KEYS.SESSION, { email: cleanEmail });
    setUser(newUser);
    return { ok: true };
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    await storage.remove(DB_KEYS.SESSION);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
