import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Copy, Check, Trash2, Building, User, Settings, Link2, XCircle, CheckCircle2 } from 'lucide-react';
import './OrganizationPages.css';

const OrganizationPage = ({ user }) => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrganizationData();
    }
  }, [user]);

  // On return from Slack OAuth (slack=connected), refresh data and clean URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('slack') === 'connected') {
      fetchOrganizationData();
      // remove the query param from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('slack');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      if (!user?.organization) {
        setError('No organization found for this user');
        setLoading(false);
        return;
      }
      const orgId = user.organization?._id || user.organization;
      const orgResponse = await fetch(`${apiUrl}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganization(orgData);
        if (orgData.members) setMembers(orgData.members);
        if (orgData.joinCode) setJoinCode(orgData.joinCode);
      } else {
        const errorData = await orgResponse.json().catch(() => ({}));
        setError(`Failed to fetch organization: ${errorData.message || 'Unknown error'}`);
      }
      if (user.role === 'admin') {
        const joinCodeResponse = await fetch(`${apiUrl}/api/organizations/join-code`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (joinCodeResponse.ok) {
          const joinCodeData = await joinCodeResponse.json();
          setJoinCode(joinCodeData.joinCode);
        }
      }
    } catch {
      setError('Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      const response = await fetch(`${apiUrl}/api/organizations/remove-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: memberId })
      });
      if (response.ok) setMembers(members.filter(m => m._id !== memberId));
      else setError('Failed to remove member');
    } catch {
      setError('Failed to remove member');
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      const response = await fetch(`${apiUrl}/api/organizations/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: memberId, role: newRole })
      });
      if (response.ok) {
        setMembers(members.map(m => m._id === memberId ? { ...m, role: newRole } : m));
      } else {
        setError('Failed to change role');
      }
    } catch {
      setError('Failed to change role');
    }
  };

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = joinCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine current user's slack connection status from members list
  const currentMember = members.find(m => (m._id === user?.id) || (m.email && m.email === user?.email));
  const currentUserConnected = Boolean(currentMember?.slackConnected);

  const connectSlack = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to connect Slack.');
      return;
    }
    // Return to the same page after OAuth
    const ret = window.location.href;
    const url = `${apiUrl}/auth/slack?token=${encodeURIComponent(token)}&return=${encodeURIComponent(ret)}`;
    window.location.href = url;
  };

  const renderSlackBadge = (member) => {
    const connected = member.slackConnected;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {connected ? (
          <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <CheckCircle2 size={14} /> Slack Connected
          </span>
        ) : (
          <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <XCircle size={14} /> Slack Not Connected
          </span>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="organization-card">
        <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Access Denied</h2>
        <p style={{ color: '#6c757d' }}>Please log in to access this page.</p>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organization-card">
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading organization data...</div>
      </motion.div>
    );
  }

  return (
    <div className="organization-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="organization-card">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="organization-header">
          <div className="organization-header-content">
            <div className="organization-icon">
              <Building size={24} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <h1 className="organization-title">
                  {user?.role === 'admin' ? 'Organization Management' : 'Organization Details'}
                </h1>
                <p className="organization-subtitle">Manage your team and organization settings</p>
              </div>
              {!currentUserConnected && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={connectSlack} className="copy-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Link2 size={16} /> Connect Slack
                </motion.button>
              )}
              {currentUserConnected && (
                <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Connected
                </span>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="error-message">
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {organization && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="organization-details">
            <h3>
              <Building size={20} />
              Organization Details
            </h3>
            <div className="details-grid">
              <motion.div whileHover={{ scale: 1.02 }} className="detail-card">
                <p className="detail-label">Organization Name</p>
                <p className="detail-value">{organization.name}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className="detail-card">
                <p className="detail-label">Total Members</p>
                <p className="detail-value">{members.length}</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="members-section">
          <h3>
            <Users size={20} />
            Organization Members ({members.length})
          </h3>
          {members.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
              <Users size={48} />
              <p>No members found.</p>
            </motion.div>
          ) : (
            <div className="members-grid">
              <AnimatePresence>
                {members.map((member, index) => (
                  <motion.div key={member._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} whileHover={{ scale: 1.02, y: -2 }} className={`member-card ${member.role === 'admin' ? 'admin' : ''}`}>
                    <div className="member-info">
                      <div className={`member-avatar ${member.role === 'admin' ? 'admin' : ''}`}>
                        {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="member-details">
                        <p className="member-name">{member.name || 'Unknown User'}</p>
                        <p className="member-email">{member.email}</p>
                        {renderSlackBadge(member)}
                      </div>
                    </div>
                    <div className="member-actions">
                      <span className={`role-badge ${member.role === 'admin' ? 'admin' : ''}`}>
                        {member.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {member.role}
                      </span>
                      {user?.role === 'admin' && member._id !== user.id && (
                        <select value={member.role} onChange={(e) => changeRole(member._id, e.target.value)} className="role-select">
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {user?.role === 'admin' && member._id !== user.id && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeMember(member._id)} className="remove-button">
                          <Trash2 size={14} />
                          Remove
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrganizationPage;
