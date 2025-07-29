import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
    fetch(`${apiUrl}/api/protected`, {
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

  if (!user) return null; // Or add a loading spinner here

  return (
    <div className="dashboard-root sidebar-open">
      <Sidebar user={user} isOpen={sidebarOpen} onLogout={handleLogout} />
      <div className="dashboard-main">
        <div className="dashboard-header-row">
          <h2 className="dashboard-title-large">👋 Welcome to Your Slack Standup Dashboard</h2>
          <div className="dashboard-user-info">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'U')}&background=23272f&color=fff&size=64`}
              alt="Profile"
              className="dashboard-user-avatar"
            />
            <span className="dashboard-user-name">{user?.name || user?.email}</span>
          </div>
        </div>

        <div className="dashboard-card-grid">
          <div className="dashboard-card" onClick={() => navigate('/summaries')}>
            <span className="dashboard-card-icon">📄</span>
            <div>
              <div className="dashboard-card-title">Summaries</div>
              <div className="dashboard-card-desc">View all daily standup summaries powered by AI.</div>
            </div>
          </div>
          <div className="dashboard-card" onClick={() => navigate('/messages')}>
            <span className="dashboard-card-icon">💬</span>
            <div>
              <div className="dashboard-card-title">Messages</div>
              <div className="dashboard-card-desc">See all the raw user messages collected from Slack.</div>
            </div>
          </div>
          <div className="dashboard-card" onClick={() => navigate('/memory')}>
            <span className="dashboard-card-icon">🧠</span>
            <div>
              <div className="dashboard-card-title">Memory</div>
              <div className="dashboard-card-desc">Explore long-term memory and team progress.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
