import React, { useState, useEffect } from 'react';

const EmployeesPage = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      // Fetch organization details which includes members
      const orgId = user.organization?._id || user.organization;
      const response = await fetch(`${apiUrl}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Employee data:', data);
        setEmployees(data.members || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch employees:', response.status, errorData);
        setError('Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const inviteEmployee = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/organizations/invite`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      if (response.ok) {
        setInviteEmail('');
        fetchEmployees(); // Refresh the list
        alert('Invitation sent successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const removeEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/organizations/remove-member`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: employeeId })
      });

      if (response.ok) {
        setEmployees(employees.filter(emp => emp._id !== employeeId));
      } else {
        setError('Failed to remove employee');
      }
    } catch (err) {
      setError('Failed to remove employee');
    }
  };

  const changeRole = async (employeeId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/organizations/change-role`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: employeeId, role: newRole })
      });

      if (response.ok) {
        setEmployees(employees.map(emp => 
          emp._id === employeeId 
            ? { ...emp, role: newRole }
            : emp
        ));
      } else {
        setError('Failed to change role');
      }
    } catch (err) {
      setError('Failed to change role');
    }
  };

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
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading employees...</div>
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
          Employee Management
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
            Invite New Employee
          </h3>
          <form onSubmit={inviteEmployee} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: '#495057',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Employee Email
              </label>
              <input
                type="email"
                placeholder="Enter employee email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '16px',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={inviting}
              style={{
                padding: '12px 24px',
                backgroundColor: inviting ? '#6c757d' : '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: inviting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s ease',
                minWidth: '120px'
              }}
              onMouseOver={(e) => !inviting && (e.target.style.backgroundColor = '#1976d2')}
              onMouseOut={(e) => !inviting && (e.target.style.backgroundColor = '#2196f3')}
            >
              {inviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </form>
        </div>

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
            Current Employees ({employees.length})
          </h3>
          {employees.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: '40px',
              color: '#6c757d'
            }}>
              <p style={{ fontSize: '16px' }}>No employees found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {employees.map(employee => (
                <div key={employee._id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '20px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: employee.role === 'admin' ? '#f8f9fa' : '#fff',
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
                        backgroundColor: employee.role === 'admin' ? '#2196f3' : '#4caf50',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        {employee.name?.charAt(0)?.toUpperCase() || employee.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ 
                          margin: '0', 
                          fontWeight: '600',
                          color: '#212529',
                          fontSize: '16px'
                        }}>
                          {employee.name || 'Unknown User'}
                        </p>
                        <p style={{ 
                          margin: '5px 0 0 0', 
                          color: '#6c757d',
                          fontSize: '14px'
                        }}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: employee.role === 'admin' ? '#2196f3' : '#4caf50',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {employee.role}
                      </span>
                      {employee._id !== user.id && (
                        <select
                          value={employee.role}
                          onChange={(e) => changeRole(employee._id, e.target.value)}
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
                  {employee._id !== user.id && (
                    <button
                      onClick={() => removeEmployee(employee._id)}
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

export default EmployeesPage;
