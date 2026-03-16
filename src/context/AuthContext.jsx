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
import { generateId, getInitials } from '../utils/formatters';
import { DB_KEYS } from '../config/db';

const AuthContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [erpUser, setErpUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: restore both CRM and ERP sessions from storage
  useEffect(() => {
    (async () => {
      // CRM session
      const session = await storage.get(DB_KEYS.SESSION);
      if (session?.email) {
        const savedUser = await storage.get(`${DB_KEYS.USERS}${session.email}`);
        if (savedUser) setUser(savedUser);
      }
      // ERP session
      const erpSession = await storage.get(DB_KEYS.ERP_SESSION);
      if (erpSession?.email) {
        const savedErpUser = await storage.get(`${DB_KEYS.ERP_USERS}${erpSession.email}`);
        if (savedErpUser) setErpUser(savedErpUser);
      }
      setLoading(false);
    })();
  }, []);

  // ── CRM Login ──────────────────────────────────────────────────────────────
  const login = async (email, password, requiredRole = null) => {
    const cleanEmail = email.toLowerCase().trim();
    const savedUser  = await storage.get(`${DB_KEYS.USERS}${cleanEmail}`);

    if (!savedUser) return { ok: false, error: 'No account found with this email.' };
    if (savedUser.password !== password) return { ok: false, error: 'Incorrect password.' };

    const isAdmin = savedUser.role === 'Admin' || savedUser.role === 'Administrator';

    if (requiredRole === 'admin' && !isAdmin) {
      return { ok: false, error: 'Access denied: Administrators only.' };
    }
    if (requiredRole === 'user' && isAdmin) {
      return { ok: false, error: 'Please use the Admin portal at /admin to log in.' };
    }

    await storage.save(DB_KEYS.SESSION, { email: cleanEmail, loginAt: new Date().toISOString() });
    setUser(savedUser);

    // Record login in database
    try {
      await fetch('http://localhost:3001/api/logs/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedUser.id,
          email: savedUser.email,
          system: requiredRole === 'admin' ? 'admin' : 'crm'
        })
      });
    } catch (err) {
      console.error('Failed to log login event:', err);
    }

    return { ok: true };
  };

  // ── CRM Signup ─────────────────────────────────────────────────────────────
  const signup = async ({ name, email, password, role }) => {
    const cleanEmail = email.toLowerCase().trim();
    const existing   = await storage.get(`${DB_KEYS.USERS}${cleanEmail}`);

    if (existing) return { ok: false, error: 'An account with this email already exists.' };

    const newUser = {
      id:        generateId(),
      name:      name.trim(),
      email:     cleanEmail,
      password,
      role:      role || 'Sales Rep',
      initials:  getInitials(name),
      createdAt: new Date().toISOString(),
    };

    await storage.save(`${DB_KEYS.USERS}${cleanEmail}`, newUser);
    await storage.save(DB_KEYS.SESSION, { email: cleanEmail });
    setUser(newUser);
    return { ok: true };
  };

  // ── CRM Logout ─────────────────────────────────────────────────────────────
  const logout = async () => {
    await storage.remove(DB_KEYS.SESSION);
    setUser(null);
  };

  // ── ERP Login ──────────────────────────────────────────────────────────────
  const erpLogin = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    const savedUser  = await storage.get(`${DB_KEYS.ERP_USERS}${cleanEmail}`);

    if (!savedUser) return { ok: false, error: 'No ERP account found with this email.' };
    if (savedUser.password !== password) return { ok: false, error: 'Incorrect password.' };

    await storage.save(DB_KEYS.ERP_SESSION, { email: cleanEmail, loginAt: new Date().toISOString() });
    setErpUser(savedUser);

    // Record login in database
    try {
      await fetch('http://localhost:3001/api/logs/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: savedUser.id,
          email: savedUser.email,
          system: 'erp'
        })
      });
    } catch (err) {
      console.error('Failed to log ERP login event:', err);
    }

    return { ok: true };
  };

  // ── ERP Signup ─────────────────────────────────────────────────────────────
  const erpSignup = async ({ name, email, password, role, shopName }) => {
    const cleanEmail = email.toLowerCase().trim();
    const existing   = await storage.get(`${DB_KEYS.ERP_USERS}${cleanEmail}`);

    if (existing) return { ok: false, error: 'An ERP account with this email already exists.' };

    const newUser = {
      id:        generateId(),
      name:      name.trim(),
      email:     cleanEmail,
      password,
      role:      role || 'Shop Owner',
      shopName:  shopName?.trim() || '',
      initials:  getInitials(name),
      system:    'erp',
      createdAt: new Date().toISOString(),
    };

    await storage.save(`${DB_KEYS.ERP_USERS}${cleanEmail}`, newUser);
    await storage.save(DB_KEYS.ERP_SESSION, { email: cleanEmail });
    setErpUser(newUser);
    return { ok: true };
  };

  // ── ERP Logout ─────────────────────────────────────────────────────────────
  const erpLogout = async () => {
    await storage.remove(DB_KEYS.ERP_SESSION);
    setErpUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, erpUser, loading, login, signup, logout, erpLogin, erpSignup, erpLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext);
}
