import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, User, Clock, AlertCircle } from 'lucide-react';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/messages')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          margin: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading messages...</div>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <MessageCircle size={24} />
            </div>
            <div>
              <h1 style={{ 
                color: '#1a1a1a',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                Standup Messages
              </h1>
              <p style={{ 
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontSize: '16px'
              }}>
                View all team standup messages and updates
              </p>
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ 
                color: '#dc2626', 
                background: '#fef2f2', 
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertCircle size={20} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280'
              }}
            >
              <MessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No messages found.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  style={{ 
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      flexShrink: 0,
                    }}>
                      <User size={20} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <p style={{ 
                          margin: '0', 
                          fontWeight: '600',
                          color: '#1a1a1a',
                          fontSize: '16px'
                        }}>
                          {msg.user}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px' }}>
                          <Clock size={12} />
                          {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                      <p style={{ 
                        margin: '0', 
                        color: '#374151',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.text || 'No message text'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MessagesPage;