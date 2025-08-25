import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, User, Clock, AlertCircle, Filter } from 'lucide-react';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]); // [{ id, name }]
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedUser, setSelectedUser] = useState(''); // stores id

  const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';

  const loadMessages = async (channel = '', user = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (channel) params.append('channel', channel);
      if (user) params.append('user', user);
      const url = `${apiUrl}/slack/messages${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setChannels(data.filters?.channels || []);
        setUsers(data.filters?.users || []);
        setError('');
      } else {
        setError('Failed to fetch messages');
      }
    } catch (e) {
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMessages(); }, []);
  useEffect(() => { loadMessages(selectedChannel, selectedUser); }, [selectedChannel, selectedUser]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <MessageCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#1a1a1a', margin: 0, fontSize: '28px', fontWeight: '700' }}>Standup Messages</h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '16px' }}>View and filter team standup messages</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Filter size={16} color="#6b7280" />
              <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <option value="">All Channels</option>
                {channels.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid #e5e7eb', minWidth: 180 }}>
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ color: '#dc2626', background: '#fef2f2', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280' }}>Loading messages…</div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p style={{ fontSize: '16px', margin: 0 }}>No messages found.</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div key={msg._id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 * index }} whileHover={{ scale: 1.02, y: -2 }} style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '16px', padding: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>
                        <User size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>
                            {msg.userName || msg.user}
                          </p>
                          <span style={{ color: '#6b7280', fontSize: 12, border: '1px solid #e5e7eb', padding: '2px 6px', borderRadius: 8 }}>
                            {msg.channel || 'no-channel'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280', fontSize: 12 }}>
                            <Clock size={12} />
                            {new Date(msg.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <p style={{ margin: 0, color: '#374151', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MessagesPage;