import React, { useState } from 'react';
import theme from '../config/theme';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Input, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import storage from '../utils/storage';
import { DB_KEYS } from '../config/db';

const T = theme;

function SettingsPage() {
  const { user } = useAuth();
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });
  
  // App Preferences
  const [preferences, setPreferences] = useState({
    theme: 'Light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  });
  
  // Notifications
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushAlerts: false,
    marketing: false
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Save all settings back to contexts and local API/storage
  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    
    // In a real production app, we would make dedicated API calls.
    // Here we'll just mock saving to the DB for the user's specific record.
    try {
      if (user?.email) {
        // Find existing user payload
        const existingUser = await storage.get(`${DB_KEYS.USERS}${user.email}`);
        if (existingUser) {
          existingUser.name = profileForm.name;
          existingUser.role = profileForm.role;
          
          await storage.save(`${DB_KEYS.USERS}${user.email}`, existingUser);
          
          // Note: changing email would require larger migration logic, so we keep it read-only or warning-based.
        }
      }
      
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage('Failed to save settings.');
    }
    
    setTimeout(() => {
      setSaving(false);
      setMessage('');
    }, 2000);
  };

  return (
    <div>
      <PageHeader title="App Settings">
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </PageHeader>
      
      {message && (
        <div style={{ padding: '12px 16px', background: T.brand.indigoLight, color: T.brand.indigo, borderRadius: T.radius.md, marginBottom: 20 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 30, maxWidth: 800 }}>
        
        {/* Profile Settings */}
        <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>My Profile</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Input 
              label="Full Name" 
              value={profileForm.name} 
              onChange={e => setProfileForm(p => ({...p, name: e.target.value}))} 
            />
            <Input 
              label="Email Address (Login ID)" 
              value={profileForm.email} 
              disabled 
              title="Email cannot be changed directly."
            />
            <Input 
              label="Job Role" 
              value={profileForm.role} 
              onChange={e => setProfileForm(p => ({...p, role: e.target.value}))} 
            />
          </div>
        </div>

        {/* Application Preferences */}
        <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>App Preferences</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Select 
              label="Theme" 
              value={preferences.theme} 
              onChange={e => setPreferences(p => ({...p, theme: e.target.value}))}
            >
              <option>Light</option>
              <option>Dark (Coming Soon)</option>
            </Select>

            <Select 
              label="Base Currency" 
              value={preferences.currency} 
              onChange={e => setPreferences(p => ({...p, currency: e.target.value}))}
            >
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </Select>

            <Select 
              label="Date Format" 
              value={preferences.dateFormat} 
              onChange={e => setPreferences(p => ({...p, dateFormat: e.target.value}))}
            >
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </Select>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>Notifications</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.emailAlerts} 
                onChange={e => setNotifications(n => ({...n, emailAlerts: e.target.checked}))} 
                style={{ width: 16, height: 16, accentColor: T.brand.indigo }}
              />
              <span style={{ fontSize: 14, color: T.text.primary }}>Receive daily digest via Email</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.pushAlerts} 
                onChange={e => setNotifications(n => ({...n, pushAlerts: e.target.checked}))} 
                style={{ width: 16, height: 16, accentColor: T.brand.indigo }}
              />
              <span style={{ fontSize: 14, color: T.text.primary }}>Enable In-App Push Notifications</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={notifications.marketing} 
                onChange={e => setNotifications(n => ({...n, marketing: e.target.checked}))} 
                style={{ width: 16, height: 16, accentColor: T.brand.indigo }}
              />
              <span style={{ fontSize: 14, color: T.text.primary }}>Receive NetJetGo marketing and feature updates</span>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;
