import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Copy, Check, Trash2, Building, User, Settings } from 'lucide-react';

const OrganizationPage = ({ user }) => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log('Members state updated:', members);
  }, [members]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrganizationData();
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      console.log('User:', user);
      console.log('User organization:', user.organization);
      console.log('User organization ID:', user.organization?._id || user.organization);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      try {
        const testResponse = await fetch(`${apiUrl}/api/organizations/test`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const testData = await testResponse.json();
        console.log('Auth test response:', testData);
      } catch (err) {
        console.error('Auth test failed:', err);
      }
      
      if (!user.organization) {
        setError('No organization found for this user');
        setLoading(false);
        return;
      }
      
      const orgId = user.organization?._id || user.organization;
      const orgResponse = await fetch(`${apiUrl}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Organization response:', orgResponse.status);
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        console.log('Organization data:', orgData);
        setOrganization(orgData);
        if (orgData.members) {
          console.log('Setting members from organization data:', orgData.members);
          setMembers(orgData.members);
        } else {
          console.log('No members found in organization data');
        }
        if (orgData.joinCode) {
          setJoinCode(orgData.joinCode);
        }
      } else {
        const errorData = await orgResponse.json().catch(() => ({}));
        console.error('Failed to fetch organization:', orgResponse.status, errorData);
      }

      const joinCodeResponse = await fetch(`${apiUrl}/api/organizations/join-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Join code response:', joinCodeResponse.status);
      
      if (joinCodeResponse.ok) {
        const joinCodeData = await joinCodeResponse.json();
        console.log('Join code data:', joinCodeData);
        setJoinCode(joinCodeData.joinCode);
      } else {
        const errorData = await joinCodeResponse.json().catch(() => ({}));
        console.error('Failed to fetch join code:', joinCodeResponse.status, errorData);
      }
    } catch (err) {
      console.error('Error fetching organization data:', err);
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
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: memberId })
      });

      if (response.ok) {
        setMembers(members.filter(member => member._id !== memberId));
      } else {
        setError('Failed to remove member');
      }
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/organizations/change-role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: memberId, role: newRole })
      });

      if (response.ok) {
        setMembers(members.map(member => 
          member._id === memberId 
            ? { ...member, role: newRole }
            : member
        ));
      } else {
        setError('Failed to change role');
      }
    } catch (err) {
      setError('Failed to change role');
    }
  };

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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

  console.log('OrganizationPage user:', user);
  
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          margin: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Access Denied</h2>
        <p style={{ color: '#6c757d' }}>Please log in to access this page.</p>
      </motion.div>
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
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading organization data...</div>
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
          marginBottom: '30px',
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
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Building size={24} />
            </div>
            <div>
              <h1 style={{ 
                color: '#1a1a1a',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                {user?.role === 'admin' ? 'Organization Management' : 'Organization Details'}
              </h1>
              <p style={{ 
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontSize: '16px'
              }}>
                Manage your team and organization settings
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
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {organization && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
              padding: '24px', 
              borderRadius: '16px', 
              marginBottom: '32px',
              border: '1px solid #e2e8f0'
            }}
          >
            <h3 style={{ 
              color: '#1a1a1a',
              marginBottom: '24px',
              fontSize: '20px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Building size={20} />
              Organization Details
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Organization Name
                </p>
                <p style={{ 
                  margin: '0', 
                  color: '#1a1a1a',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {organization.name}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <p style={{ 
                  margin: '0 0 8px 0', 
                  color: '#6b7280',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Total Members
                </p>
                <p style={{ 
                  margin: '0', 
                  color: '#1a1a1a',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {members.length}
                </p>
              </motion.div>
            </div>
            
            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ 
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                  padding: '24px', 
                  borderRadius: '16px', 
                  border: '2px solid #3b82f6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <p style={{ 
                      margin: '0 0 12px 0', 
                      fontWeight: '600', 
                      color: '#1e40af',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Copy size={16} />
                      Organization Join Code
                    </p>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.9)',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6',
                      display: 'inline-block',
                      marginBottom: '8px',
                    }}>
                      <span style={{ 
                        fontSize: '24px', 
                        letterSpacing: '4px',
                        fontWeight: '700',
                        color: '#1e40af',
                        fontFamily: 'monospace'
                      }}>
                        {joinCode || 'Loading...'}
                      </span>
                    </div>
                    <p style={{ 
                      margin: '0', 
                      fontSize: '14px', 
                      color: '#6b7280',
                      fontStyle: 'italic'
                    }}>
                      Share this code with employees to let them join your organization
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyJoinCode}
                    style={{
                      padding: '16px 24px',
                      background: copied ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: '120px',
                      justifyContent: 'center',
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h3 style={{ 
            color: '#1a1a1a',
            marginBottom: '24px',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Users size={20} />
            Organization Members ({members.length})
          </h3>
          {members.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ 
                textAlign: 'center',
                padding: '60px 20px',
                color: '#6b7280'
              }}
            >
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No members found.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <AnimatePresence>
                {members.map((member, index) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      background: member.role === 'admin' ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: member.role === 'admin' 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '18px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}>
                        {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          fontWeight: '600',
                          color: '#1a1a1a',
                          fontSize: '16px'
                        }}>
                          {member.name || 'Unknown User'}
                        </p>
                        <p style={{ 
                          margin: '0', 
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        background: member.role === 'admin' 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        {member.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {member.role}
                      </span>
                      {user?.role === 'admin' && member._id !== user.id && (
                        <select
                          value={member.role}
                          onChange={(e) => changeRole(member._id, e.target.value)}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '12px',
                            background: 'white',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {user?.role === 'admin' && member._id !== user.id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeMember(member._id)}
                          style={{
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
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
