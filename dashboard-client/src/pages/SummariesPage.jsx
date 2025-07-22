import React, { useEffect, useState } from 'react';

const SummariesPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch('http://localhost:3000/summaries'); // adjust if deployed
        const data = await response.json();
        const filtered = data.filter(item => item.user === "U095Z3FPY8N" || item.user === "StandupBot");
        setSummaries(filtered.reverse()); // latest first
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="summaries-page">
      <h2>📄 Conversation Summaries</h2>
      <div className="summary-list">
        {summaries.map((item, index) => (
          <div key={index} className="summary-card">
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummariesPage;
