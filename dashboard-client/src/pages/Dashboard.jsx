import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetch('http://localhost:3000/api/protected', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">👋 Welcome to Your Slack Standup Dashboard</h2>
      {user && (
        <div className="user-info">
          <p><b>User:</b> {user.name || user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <div className="dashboard-cards">
        <div className="card" onClick={() => navigate('/summaries')}>
          <h3>📝 Summaries</h3>
          <p>View all daily standup summaries powered by AI.</p>
        </div>
        <div className="card" onClick={() => navigate('/messages')}>
          <h3>💬 Messages</h3>
          <p>See all the raw user messages collected from Slack.</p>
        </div>
        <div className="card" onClick={() => navigate('/memory')}>
          <h3>🧠 Memory</h3>
          <p>Explore long-term memory and team progress.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
