// src/pages/collaboration/DiscussionRoomPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import theme from '../../config/theme';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const T = theme;
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
const authHeader = () => ({ 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('session'))?.token}`, 'Content-Type': 'application/json' });

const ROOM_COLORS = ['#3D3BAF','#E8197A','#10B981','#F59E0B','#8B5CF6','#3B82F6','#F97316'];

export default function DiscussionRoomPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRoomModal, setNewRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ roomName: '', topic: '' });
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchRooms = useCallback(() => {
    fetch(`${API_BASE}/api/collab/discussions/rooms`, { headers: authHeader() })
      .then(r => r.json()).then(data => { setRooms(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchPosts = useCallback((roomName) => {
    fetch(`${API_BASE}/api/collab/discussions?roomName=${encodeURIComponent(roomName)}`, { headers: authHeader() })
      .then(r => r.json()).then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);
  useEffect(() => { if (activeRoom) fetchPosts(activeRoom.roomName); }, [activeRoom, fetchPosts]);

  const createRoom = async () => {
    if (!roomForm.roomName) return alert('Room name required');
    await fetch(`${API_BASE}/api/collab/discussions`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({ roomName: roomForm.roomName, topic: roomForm.topic, message: `#${roomForm.roomName.replace(/\s+/g,'-').toLowerCase()} created`, authorName: user?.name, authorId: user?.id })
    });
    setNewRoomModal(false); setRoomForm({ roomName: '', topic: '' }); fetchRooms();
  };

  const sendPost = async () => {
    if (!replyText.trim() || !activeRoom) return;
    setSending(true);
    await fetch(`${API_BASE}/api/collab/discussions`, {
      method: 'POST', headers: authHeader(),
      body: JSON.stringify({ roomName: activeRoom.roomName, topic: activeRoom.topic, message: replyText, authorName: user?.name, authorId: user?.id })
    });
    setReplyText(''); fetchPosts(activeRoom.roomName); setSending(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await fetch(`${API_BASE}/api/collab/discussions/${id}`, { method: 'DELETE', headers: authHeader() });
    fetchPosts(activeRoom.roomName);
  };

  const getColor = (name) => ROOM_COLORS[name.charCodeAt(0) % ROOM_COLORS.length];
  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
  const topLevelPosts = posts.filter(p => !p.parentId);

  if (activeRoom) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => { setActiveRoom(null); setPosts([]); }} style={{ background: 'none', border: 'none', color: T.brand.indigo, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>← All Rooms</button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900 }}>#{activeRoom.roomName.replace(/\s+/g,'-').toLowerCase()}</h2>
            {activeRoom.topic && <div style={{ fontSize: 13, color: T.text.muted }}>{activeRoom.topic}</div>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {topLevelPosts.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: T.text.muted, background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p>No posts yet. Start the conversation!</p>
            </div>
          ) : topLevelPosts.map(p => (
            <div key={p.id} style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: getColor(p.authorName||'A'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  {getInitials(p.authorName)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.authorName || 'Anonymous'}</span>
                    <span style={{ fontSize: 12, color: T.text.subtle }}>{new Date(p.createdAt).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <p style={{ fontSize: 14, color: T.text.primary, lineHeight: 1.6, margin: 0 }}>{p.message}</p>
                </div>
                {(user?.id === p.authorId || ['Admin','CEO / Founder'].includes(user?.role)) && (
                  <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: 'none', color: T.text.subtle, cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 16, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPost(); } }}
            placeholder={`Post in #${activeRoom.roomName}... (Enter to send, Shift+Enter for new line)`}
            style={{ flex: 1, padding: '10px 14px', border: `1px solid ${T.border.light}`, borderRadius: T.radius.md, fontFamily: 'inherit', fontSize: 14, resize: 'none', outline: 'none', minHeight: 60, color: T.text.primary }} rows={2}
          />
          <button onClick={sendPost} disabled={sending || !replyText.trim()}
            style={{ padding: '12px 20px', background: T.brand.indigo, color: '#fff', border: 'none', borderRadius: T.radius.md, fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: (!replyText.trim() || sending) ? 0.5 : 1 }}>
            Send →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Discussion Rooms" subtitle="Topic-focused channels for team conversations.">
        {['Admin', 'CEO / Founder', 'HR Manager', 'Marketing Specialist', 'Project Manager'].includes(user?.role) && (
          <Button onClick={() => setNewRoomModal(true)}>+ New Room</Button>
        )}
      </PageHeader>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: T.text.muted }}>Loading rooms...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {rooms.length === 0 ? (
            <div style={{ gridColumn:'1/-1', padding: 60, textAlign: 'center', background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <h3 style={{ fontWeight: 800, marginBottom: 8 }}>No discussion rooms yet</h3>
              <p style={{ color: T.text.muted, marginBottom: 20 }}>Create a room to start a team conversation.</p>
              <Button onClick={() => setNewRoomModal(true)}>+ New Room</Button>
            </div>
          ) : rooms.map(room => {
            const color = getColor(room.roomName);
            return (
              <div key={room.roomName} onClick={() => setActiveRoom(room)}
                style={{ background: T.surface.card, borderRadius: T.radius.lg, border: `1px solid ${T.border.light}`, padding: 24, cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${T.brand.indigoGlow}`; e.currentTarget.style.borderColor = `${T.brand.indigo}40`; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = T.border.light; }}>
                <div style={{ width: 40, height: 40, borderRadius: T.radius.md, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 900, marginBottom: 16 }}>
                  #
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>#{room.roomName.replace(/\s+/g,'-').toLowerCase()}</h3>
                {room.topic && <p style={{ fontSize: 13, color: T.text.muted, marginBottom: 12 }}>{room.topic}</p>}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text.subtle }}>
                  <span>💬 {room.postCount} posts</span>
                  <span>🕐 {new Date(room.lastActivity).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {newRoomModal && (
        <Modal title="Create Discussion Room" onClose={() => setNewRoomModal(false)} onSave={createRoom} saveLabel="Create Room">
          <div style={{ display: 'grid', gap: 16 }}>
            <Input label="Room Name *" value={roomForm.roomName} onChange={e => setRoomForm(p => ({ ...p, roomName: e.target.value }))} placeholder="e.g. Product Roadmap" />
            <Input label="Topic / Purpose" value={roomForm.topic} onChange={e => setRoomForm(p => ({ ...p, topic: e.target.value }))} placeholder="What is this room about?" />
          </div>
        </Modal>
      )}
    </div>
  );
}
