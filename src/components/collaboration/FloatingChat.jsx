// src/components/collaboration/FloatingChat.jsx
import React, { useState } from 'react';
import theme from '../../config/theme';

const T = theme;

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the NetJet Business Chat!', time: '9:00 AM' },
    { id: 2, user: 'Admin', text: 'Team, please check the new inventory updates.', time: '10:15 AM' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages(p => [...p, { id: Date.now(), user: 'You', text: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInput('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 30, right: 30, width: 60, height: 60, borderRadius: '50%',
          background: T.brand.indigo, color: '#fff', border: 'none', fontSize: 24, cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(61,59,175,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        💬
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 30, right: 30, width: 450, height: 650, background: '#fff',
      borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000
    }}>
      <div style={{ padding: '20px 24px', background: T.brand.indigo, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>Team Collaboration Chat</span>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 24 }}>×</button>
      </div>

      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map(m => (
          <div key={m.id} style={{ alignSelf: m.user === 'You' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ fontSize: 10, color: T.text.muted, marginBottom: 4, textAlign: m.user === 'You' ? 'right' : 'left' }}>{m.user} • {m.time}</div>
            <div style={{ padding: '10px 16px', borderRadius: 12, background: m.user === 'You' ? T.brand.indigo : T.surface.sidebarAlpha, color: m.user === 'You' ? '#fff' : T.text.primary, fontSize: 14 }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${T.border.light}`, display: 'flex', gap: 10 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && send()}
          placeholder="Type your message..." 
          style={{ flex: 1, padding: '12px 16px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, outline: 'none', fontSize: 14 }} 
        />
        <button onClick={send} style={{ padding: '10px 20px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}
