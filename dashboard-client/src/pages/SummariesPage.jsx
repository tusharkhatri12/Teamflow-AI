import React, { useEffect, useState } from 'react';

const SummariesPage = ({ user }) => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
        
        // For now, we'll use the existing endpoint but in the future this should be role-based
        const response = await fetch(`${apiUrl}/summaries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter(item => item.user === "U095Z3FPY8N" || item.user === "StandupBot");
          setSummaries(filtered.reverse()); // latest first
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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>📄 Conversation Summaries</h2>
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      {user?.role === 'employee' && (
        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '10px', 
          borderRadius: '5px', 
          marginBottom: '20px' 
        }}>
          <p style={{ margin: '0' }}>You are viewing your personal summaries.</p>
        </div>
      )}
      
      <div className="summary-list">
        {summaries.length === 0 ? (
          <p>No summaries found.</p>
        ) : (
          summaries.map((item, index) => (
            <div key={index} className="summary-card">
              <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SummariesPage;
