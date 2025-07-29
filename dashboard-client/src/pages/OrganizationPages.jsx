import React, { useState, useEffect } from 'react';
import './OrganizationPages.css';

const OrganizationPage = ({ user }) => {
  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOrganizationData();
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      // Fetch organization details
      const orgResponse = await fetch(`${apiUrl}/api/organizations/${user.organization}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganization(orgData);
      }

      // Fetch organization members
      const membersResponse = await fetch(`${apiUrl}/api/organizations/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData.members);
      }
    } catch (err) {
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
          <p><strong>Join Code:</strong> {organization.joinCode}</p>
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
