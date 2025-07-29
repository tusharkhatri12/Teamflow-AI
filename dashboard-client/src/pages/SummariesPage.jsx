import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';

const SummariesPage = ({ user }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
        
        const response = await fetch(`${apiUrl}/summaries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter(item => item.user === "U095Z3FPY8N" || item.user === "StandupBot");
          setSummaries(filtered.reverse());
        } else {
          setError('Failed to fetch summaries');
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
        setError('Failed to fetch summaries');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
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
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading summaries...</div>
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
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <FileText size={24} />
            </div>
            <div>
              <h1 style={{ 
                color: '#1a1a1a',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                Conversation Summaries
              </h1>
              <p style={{ 
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontSize: '16px'
              }}>
                View your team's conversation summaries and insights
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
        
        {user?.role === 'employee' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
              padding: '16px', 
              borderRadius: '12px', 
              marginBottom: '24px',
              border: '1px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle size={20} color="#3b82f6" />
            <p style={{ margin: '0', color: '#1e40af', fontWeight: '500' }}>
              You are viewing your personal summaries.
            </p>
          </motion.div>
        )}
        
        <div style={{ display: 'grid', gap: '20px' }}>
          {summaries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280'
              }}
            >
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No summaries found.</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {summaries.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  style={{ 
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}>
                      <FileText size={16} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontWeight: '600',
                        color: '#1a1a1a',
                        fontSize: '14px'
                      }}>
                        Summary #{index + 1}
                      </p>
                      <p style={{ 
                        margin: '0', 
                        color: '#6b7280',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Clock size={12} />
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}>
                    <p style={{ 
                      margin: '0', 
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      {item.message}
                    </p>
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

export default SummariesPage;
