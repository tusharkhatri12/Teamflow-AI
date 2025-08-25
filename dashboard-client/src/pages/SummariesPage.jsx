import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, User, AlertCircle, CheckCircle, TrendingUp, Search } from 'lucide-react';
import Analytics from '../components/Analytics';
import MeetingUpload from '../components/MeetingUpload';

const SummariesPage = ({ user }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summaries'); // 'summaries' | 'analytics' | 'meetings'
  const [meetings, setMeetings] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'summaries') fetchSummaries();
    if (activeTab === 'meetings') fetchMeetings();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
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
      setError('Failed to fetch summaries');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      const response = await fetch(`${apiUrl}/api/meetings`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      } else {
        setError('Failed to fetch meetings');
      }
    } catch (e) {
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const onMeetingUploaded = (meeting) => {
    setMeetings(prev => [meeting, ...prev]);
    setActiveTab('meetings');
  };

  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  const renderTabContent = () => {
    if (activeTab === 'analytics') return <Analytics user={user} />;
    if (activeTab === 'meetings') {
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', top: 10, left: 10, color: '#6b7280' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title"
                style={{
                  width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10,
                  border: '1px solid #e5e7eb'
                }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>Loading meetings…</div>
          ) : filteredMeetings.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280' }}>No meetings found.</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {filteredMeetings.map((m) => (
                <div key={m._id} style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 16,
                  padding: 16
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0 }}>{m.title}</h3>
                    <span style={{ color: '#6b7280', fontSize: 12 }}>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                    {['keyPoints','decisions','actionItems','risks'].map((sectionKey) => (
                      <div key={sectionKey}>
                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                          {sectionKey === 'keyPoints' ? 'Key Discussion Points' :
                           sectionKey === 'decisions' ? 'Decisions Made' :
                           sectionKey === 'actionItems' ? 'Action Items' : 'Risks / Follow-ups'}
                        </div>
                        {(m.summary?.[sectionKey] || []).length === 0 ? (
                          <div style={{ color: '#6b7280', fontSize: 14 }}>No items.</div>
                        ) : (
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {m.summary[sectionKey].map((item, idx) => (
                              <li key={idx} style={{ color: '#374151', fontSize: 14 }}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

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
    );
  };

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
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
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
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                color: '#1a1a1a',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                Summaries & Analytics
              </h1>
              <p style={{ 
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontSize: '16px'
              }}>
                View your team's conversation summaries and insights
              </p>
            </div>

            <div style={{ minWidth: 420 }}>
              <MeetingUpload onUploaded={onMeetingUploaded} />
            </div>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', gap: '8px', background: '#f3f4f6', padding: '4px', borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            {[
              { id: 'summaries', label: 'Summaries', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'meetings', label: 'Meeting Uploads', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '12px 20px', borderRadius: 8, border: 'none',
                    background: activeTab === tab.id ? '#8b5cf6' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#6b7280', cursor: 'pointer', fontWeight: 500
                  }}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SummariesPage;
