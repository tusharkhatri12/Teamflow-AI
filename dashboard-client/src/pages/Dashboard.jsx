import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageCircle,
  Brain,
  Building,
  Users,
} from 'lucide-react';
import './Dashboard.css';

const cardData = [
  {
    path: '/summaries',
    title: 'Summaries',
    descAdmin: 'View all daily standup summaries powered by AI.',
    descEmployee: 'View your daily standup summaries powered by AI.',
    icon: <FileText size={32} color="#2563eb" />,
  },
  {
    path: '/messages',
    title: 'Messages',
    descAdmin: 'See all the raw user messages collected from Slack.',
    descEmployee: 'See all your raw messages collected from Slack.',
    icon: <MessageCircle size={32} color="#2563eb" />,
  },
  {
    path: '/memory',
    title: 'Memory',
    descAdmin: 'Explore long-term memory and team progress.',
    descEmployee: 'Explore your long-term memory and progress.',
    icon: <Brain size={32} color="#2563eb" />,
  },
];

const adminCards = [
  {
    path: '/organizations',
    title: 'Organization',
    desc: 'Manage your organization settings and join codes.',
    icon: <Building size={32} color="#2563eb" />,
  },
  {
    path: '/employees',
    title: 'Employees',
    desc: 'View and manage all employees in your organization.',
    icon: <Users size={32} color="#2563eb" />,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) {
      navigate('/login');
      return;
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  if (!user) return <div className="loader" />;

  return (
    <div className="main" style={{ minHeight: '100vh', padding: '2em 0' }}>
      <div className="flex-between gap-2" style={{ marginBottom: '2em', flexWrap: 'wrap' }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: '#181a20' }}>
          👋 Welcome, {user.name || user.email}!
        </h1>
        <div className="flex gap-2 flex-center">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'U')}&background=23272f&color=fff&size=64`}
            alt="Profile"
            style={{ width: 48, height: 48, borderRadius: '50%', background: '#23272f' }}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 grid-gap-3" style={{ marginBottom: '2em' }}>
        {cardData.map((card, idx) => (
          <motion.div
            key={card.path}
            className="card shadow flex flex-col gap-2"
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(37,99,235,0.13)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * idx } }}
            onClick={() => navigate(card.path)}
            style={{ cursor: 'pointer', minHeight: 180, justifyContent: 'center', alignItems: 'flex-start' }}
          >
            <div className="flex flex-center" style={{ marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{card.title}</div>
            <div className="text-muted" style={{ fontSize: 15 }}>
              {user?.role === 'admin' ? card.descAdmin : card.descEmployee}
            </div>
          </motion.div>
        ))}
        {user?.role === 'admin' && adminCards.map((card, idx) => (
          <motion.div
            key={card.path}
            className="card shadow flex flex-col gap-2"
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(37,99,235,0.13)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + 0.05 * idx } }}
            onClick={() => navigate(card.path)}
            style={{ cursor: 'pointer', minHeight: 180, justifyContent: 'center', alignItems: 'flex-start' }}
          >
            <div className="flex flex-center" style={{ marginBottom: 12 }}>{card.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{card.title}</div>
            <div className="text-muted" style={{ fontSize: 15 }}>{card.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
