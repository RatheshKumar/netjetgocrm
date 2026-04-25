import React, { useState, useEffect, useRef } from 'react';
import theme from '../config/theme';

const T = theme;

const API_BASE = window.location.hostname === 'localhost' && window.location.port === '3000' ? 'http://localhost:3001' : '';

const getToken = () => {
  try {
    const session = JSON.parse(localStorage.getItem('session:current'));
    return session?.token || '';
  } catch (e) { return ''; }
};

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced API call
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // Keep selected item firmly in view on arrow navigate
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeElement = listRef.current.children[selectedIndex];
      if (activeElement) {
         activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (item) => {
    window.dispatchEvent(new CustomEvent('nav-change', { detail: item.route }));
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '10vh'
    }} onClick={() => setIsOpen(false)}>
      
      <div style={{
        background: T.surface.page, width: '100%', maxWidth: 640,
        borderRadius: T.radius.lg, boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        overflow: 'hidden', border: `1px solid ${T.border.light}`
      }} onClick={e => e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: `1px solid ${T.border.light}` }}>
          <span style={{ fontSize: 20, color: T.brand.indigo, marginRight: 12 }}>🔍</span>
          <input
            ref={inputRef}
            placeholder="Search contacts, deals, employees..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1, padding: '24px 0', border: 'none', background: 'transparent',
              fontSize: 18, color: T.text.primary, outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <kbd style={{ background: T.surface.sidebar, color: T.text.muted, padding: '4px 8px', borderRadius: 4, border: `1px solid ${T.border.light}`, fontSize: 12, fontWeight: 700 }}>esc</kbd>
          </div>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 24, textAlign: 'center', color: T.text.muted, fontWeight: 600 }}>Searching database...</div>}
          
          {!loading && query && results.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
              No results found for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div ref={listRef} style={{ padding: 8 }}>
              {results.map((item, index) => {
                const isActive = index === selectedIndex;
                return (
                  <div
                    key={item.type + item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                      background: isActive ? T.brand.indigo + '15' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 16, transition: '0.1s'
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: isActive ? T.brand.indigo : T.surface.sidebar,
                      color: isActive ? '#fff' : T.text.muted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      boxShadow: isActive ? `0 4px 10px ${T.brand.indigo}40` : 'none'
                    }}>
                      {item.type === 'Deal' ? '🤝' : item.type === 'Contact' ? '👤' : '👔'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: isActive ? T.brand.indigo : T.text.primary }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 13, color: T.text.muted, display: 'flex', gap: 8, marginTop: 4 }}>
                        <span style={{ fontWeight: 700 }}>{item.type}</span>
                        {item.detail1 && (
                          <>
                            <span style={{ color: T.border.medium }}>•</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.detail1}
                            </span>
                          </>
                        )}
                        {item.detail2 && (
                          <>
                            <span style={{ color: T.border.medium }}>•</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.detail2}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <kbd style={{ background: T.brand.indigo, color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, boxShadow: `0 2px 5px ${T.brand.indigo}40` }}>
                        Enter ↵
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ padding: '8px 20px', background: T.surface.sidebar, borderTop: `1px solid ${T.border.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: T.text.muted, fontSize: 12 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <span><kbd style={{ padding: '2px 4px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: 3 }}>↑</kbd> <kbd style={{ padding: '2px 4px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: 3 }}>↓</kbd> to navigate</span>
            <span><kbd style={{ padding: '2px 4px', background: T.surface.page, border: `1px solid ${T.border.light}`, borderRadius: 3 }}>↵</kbd> to select</span>
          </div>
          <div>Unified Global Search</div>
        </div>

      </div>
    </div>
  );
}
