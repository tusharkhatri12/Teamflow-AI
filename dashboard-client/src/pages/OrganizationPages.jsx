import React, { useState, useEffect } from 'react';
import './OrganizationPages.css';

const OrganizationPage = ({ user }) => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrganizationData();
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      console.log('User organization:', user.organization);
      
      if (!user.organization) {
        setError('No organization found for this user');
        setLoading(false);
        return;
      }
      
      // Fetch organization details
      const orgResponse = await fetch(`${apiUrl}/api/organizations/${user.organization}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Organization response:', orgResponse.status);
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        console.log('Organization data:', orgData);
        setOrganization(orgData);
        // Also set join code from organization data as fallback
        if (orgData.joinCode) {
          setJoinCode(orgData.joinCode);
        }
      } else {
        console.error('Failed to fetch organization:', orgResponse.status);
      }

      // Fetch organization join code
      const joinCodeResponse = await fetch(`${apiUrl}/api/organizations/join-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Join code response:', joinCodeResponse.status);
      
      if (joinCodeResponse.ok) {
        const joinCodeData = await joinCodeResponse.json();
        console.log('Join code data:', joinCodeData);
        setJoinCode(joinCodeData.joinCode);
      } else {
        console.error('Failed to fetch join code:', joinCodeResponse.status);
      }

      // Fetch organization members
      const membersResponse = await fetch(`${apiUrl}/api/organizations/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Members response:', membersResponse.status);
      
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        console.log('Members data:', membersData);
        setMembers(membersData.members);
      } else {
        console.error('Failed to fetch members:', membersResponse.status);
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

  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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
  
  if (user?.role !== 'admin') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Organization Management</h2>
      
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

      {organization && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px', 
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3>Organization Details</h3>
          <p><strong>Name:</strong> {organization.name}</p>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '10px 0',
            border: '2px solid #007bff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0', fontWeight: 'bold', color: '#007bff' }}>
                  Organization Join Code: <span style={{ fontSize: '18px', letterSpacing: '2px' }}>{joinCode}</span>
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Share this code with employees to let them join your organization
                </p>
              </div>
              <button
                onClick={copyJoinCode}
                style={{
                  padding: '8px 16px',
                  backgroundColor: copied ? '#28a745' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <p><strong>Total Members:</strong> {members.length}</p>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>Organization Members</h3>
        {members.length === 0 ? (
          <p>No members found.</p>
        ) : (
          <div>
            {members.map(member => (
              <div key={member._id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <p><strong>{member.name}</strong></p>
                  <p style={{ color: '#666' }}>{member.email}</p>
                  <p style={{ color: '#007bff' }}>{member.role}</p>
                </div>
                {member._id !== user.id && (
                  <button
                    onClick={() => removeMember(member._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationPage;
