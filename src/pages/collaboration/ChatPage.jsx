// src/pages/collaboration/ChatPage.jsx
import React, { useState } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';

const T = theme;

export default function ChatPage() {
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

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Team Chat" subtitle="Real-time collaboration across all modules" />
      
      <div style={{ flex: 1, background: '#fff', borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.user === 'You' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{ fontSize: 10, color: T.text.muted, marginBottom: 4, textAlign: m.user === 'You' ? 'right' : 'left' }}>{m.user} • {m.time}</div>
              <div style={{ padding: '10px 14px', borderRadius: 12, background: m.user === 'You' ? T.brand.indigo : T.surface.sidebarAlpha, color: m.user === 'You' ? '#fff' : T.text.primary, fontSize: 13 }}>
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
            placeholder="Type a message..." 
            style={{ flex: 1, padding: '10px 14px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, outline: 'none' }} 
          />
          <button onClick={send} style={{ padding: '10px 20px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  );
}
