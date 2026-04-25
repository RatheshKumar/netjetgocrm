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

export default function FloatingHRAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi! I am your HR Assistant. You can ask me about your profile, leave balance, or even apply for leave directly here!' }
    ]);
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        if (endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const sendMessage = async (presetMessage) => {
        const msg = presetMessage || input.trim();
        if (!msg) return;

        if (!presetMessage) setInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/ai/hr/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ message: msg })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setMessages(prev => [...prev, { role: 'ai', content: data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error || 'Failed to connect'}` }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Network error. Please try again.' }]);
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

    const suggestions = [
        "How many leave days do I have?",
        "What is my current salary?",
        "Apply for leave for next Friday"
    ];

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed', bottom: 24, right: 160, 
                    width: 56, height: 56, borderRadius: '50%',
                    background: T.brand.orange, color: '#fff', fontSize: 24,
                    border: 'none', cursor: 'pointer', boxShadow: `0 4px 14px ${T.brand.orange}80`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 998
                }}
            >
                👔
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 90, right: 160, 
                    width: 380, height: 550, background: 'var(--color-surface-card)',
                    borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column', zIndex: 998,
                    border: `1px solid var(--color-border-light)`
                }}>
                    <div style={{ 
                        background: T.brand.orange, color: '#fff', padding: '16px 20px', 
                        borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                            💼 AI HR Assistant
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>×</button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ 
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%'
                            }}>
                                <div style={{ 
                                    background: m.role === 'user' ? T.brand.orange : T.surface.page,
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
                        {loading && <div style={{ alignSelf: 'flex-start', fontSize: 12, color: T.text.muted }}>AI is thinking...</div>}
                        <div ref={endRef} />
                    </div>

                    {messages.length < 3 && (
                        <div style={{ padding: '0 20px 10px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {suggestions.map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => sendMessage(s)}
                                    style={{ 
                                        padding: '6px 12px', borderRadius: 20, border: `1px solid ${T.brand.orange}40`, 
                                        background: 'transparent', fontSize: 11, cursor: 'pointer', color: T.brand.orange 
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ padding: 16, borderTop: `1px solid var(--color-border-light)`, display: 'flex', gap: 8 }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your HR question..."
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14,
                                border: `1px solid var(--color-border-medium)`, outline: 'none'
                            }}
                        />
                        <button 
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                padding: '0 16px', borderRadius: 8, border: 'none',
                                background: input.trim() && !loading ? T.brand.orange : T.border.medium,
                                color: '#fff', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            →
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
