import React, { useState, useEffect } from 'react';

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
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Access Denied</h2>
        <p style={{ color: '#6c757d' }}>Only administrators can access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading organization data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e9ecef'
      }}>
        <h1 style={{ 
          color: '#212529',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600'
        }}>
          Organization Management
        </h1>
        
        {error && (
          <div style={{ 
            color: '#721c24', 
            backgroundColor: '#f8d7da', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {organization && (
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '25px', 
            borderRadius: '10px', 
            marginBottom: '30px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ 
              color: '#212529',
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Organization Details
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '25px'
            }}>
              <div>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Organization Name
                </p>
                <p style={{ 
                  margin: '0', 
                  color: '#212529',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {organization.name}
                </p>
              </div>
              <div>
                <p style={{ 
                  margin: '0 0 5px 0', 
                  color: '#6c757d',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Total Members
                </p>
                <p style={{ 
                  margin: '0', 
                  color: '#212529',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {members.length}
                </p>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '2px solid #2196f3'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontWeight: '600', 
                    color: '#1976d2',
                    fontSize: '16px'
                  }}>
                    Organization Join Code
                  </p>
                  <div style={{ 
                    backgroundColor: '#fff',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    border: '1px solid #bbdefb',
                    display: 'inline-block'
                  }}>
                    <span style={{ 
                      fontSize: '20px', 
                      letterSpacing: '3px',
                      fontWeight: '700',
                      color: '#1976d2',
                      fontFamily: 'monospace'
                    }}>
                      {joinCode || 'Loading...'}
                    </span>
                  </div>
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '14px', 
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    Share this code with employees to let them join your organization
                  </p>
                </div>
                <button
                  onClick={copyJoinCode}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: copied ? '#4caf50' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s ease',
                    minWidth: '100px'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = copied ? '#45a049' : '#1976d2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = copied ? '#4caf50' : '#2196f3'}
                >
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            color: '#212529',
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Organization Members ({members.length})
          </h3>
          {members.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <p style={{ fontSize: '16px' }}>No members found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {members.map(member => (
                <div key={member._id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '20px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: member.role === 'admin' ? '#f8f9fa' : '#fff',
                  transition: 'box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.target.style.boxShadow = 'none'}
                >
                  <div style={{ flex: '1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: member.role === 'admin' ? '#2196f3' : '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ 
                          margin: '0', 
                          fontWeight: '600',
                          color: '#212529',
                          fontSize: '16px'
                        }}>
                          {member.name || 'Unknown User'}
                        </p>
                        <p style={{ 
                          margin: '5px 0 0 0', 
                          color: '#6c757d',
                          fontSize: '14px'
                        }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: member.role === 'admin' ? '#2196f3' : '#4caf50',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {member.role}
                      </span>
                      {member._id !== user.id && (
                        <select
                          value={member.role}
                          onChange={(e) => changeRole(member._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '12px',
                            backgroundColor: '#fff'
                          }}
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {member._id !== user.id && (
                    <button
                      onClick={() => removeMember(member._id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
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
    </div>
  );
};

export default OrganizationPage;
