import React, { useState, useRef, useEffect } from 'react';
import theme from '../../config/theme';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' && window.location.port === '3000' ? 'http://localhost:3001' : '';

const getToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem('session:current'));
    return session?.token || '';
  } catch (e) { return ''; }
};

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your AI CRM Assistant. How can I help you coordinate today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [ctxLeads, setCtxLeads] = useState(true);
  const [ctxStaff, setCtxStaff] = useState(false);
  const [ctxTasks, setCtxTasks] = useState(true);

  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          message: userMsg,
          context: {
            leads: ctxLeads,
            employees: ctxStaff,
            tasks: ctxTasks
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error || 'Failed to communicate with AI'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error. Make sure the backend is reachable.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 90, // offset from FloatingChat
          width: 56, height: 56, borderRadius: '50%',
          background: T.brand.pink, color: '#fff', fontSize: 24,
          border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${T.brand.pink}80`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}
      >
        ✨
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 90, right: 90, 
          width: 380, height: 550, background: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', zIndex: 999,
          border: `1px solid var(--color-border-light)`
        }}>
          {/* Header */}
          <div style={{ 
            background: T.brand.indigo, color: '#fff', padding: '16px 20px', 
            borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✨ NetJet AI Copilot
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          {/* Context Controls */}
          <div style={{ padding: '8px 16px', background: T.surface.page, borderBottom: `1px solid var(--color-border-light)`, fontSize: 11, color: T.text.muted, display: 'flex', gap: 12, alignItems: 'center' }}>
            <strong>CONTEXT:</strong>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={ctxLeads} onChange={e => setCtxLeads(e.target.checked)} /> Leads
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={ctxStaff} onChange={e => setCtxStaff(e.target.checked)} /> Staff
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input type="checkbox" checked={ctxTasks} onChange={e => setCtxTasks(e.target.checked)} /> Tasks
            </label>
          </div>

          {/* Chat Feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                <div style={{ 
                  background: m.role === 'user' ? T.brand.indigo : T.surface.page,
                  color: m.role === 'user' ? '#fff' : T.text.primary,
                  padding: '10px 14px', borderRadius: '12px',
                  borderBottomRightRadius: m.role === 'user' ? 2 : '12px',
                  borderBottomLeftRadius: m.role === 'ai' ? 2 : '12px',
                  fontSize: 14, lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', fontSize: 12, color: T.text.muted, display: 'flex', gap: 4 }}>
                <span className="dot">●</span><span className="dot">●</span><span className="dot">●</span>
                <style>{`
                  @keyframes pulse { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
                  .dot { animation: pulse 1s infinite; }
                  .dot:nth-child(2) { animation-delay: 0.2s; }
                  .dot:nth-child(3) { animation-delay: 0.4s; }
                `}</style>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 16, borderTop: `1px solid var(--color-border-light)`, display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about pipeline, team availability..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14,
                border: `1px solid var(--color-border-medium)`, outline: 'none',
                resize: 'none', height: 44, fontFamily: 'var(--font-family-body)'
              }}
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: '0 16px', borderRadius: 8, border: 'none',
                background: input.trim() && !loading ? T.brand.indigo : T.border.medium,
                color: '#fff', fontWeight: 700, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
