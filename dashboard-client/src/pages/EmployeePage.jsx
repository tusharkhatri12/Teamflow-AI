import React, { useState, useEffect } from 'react';
import './EmployeePage.css';

const EmployeesPage = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      const response = await fetch(`${apiUrl}/api/organizations/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.members);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err) {
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const inviteEmployee = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

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
      <h2>Employee Management</h2>
      
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

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>Invite New Employee</h3>
        <form onSubmit={inviteEmployee} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="email"
            placeholder="Enter employee email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
            required
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Invite
          </button>
        </form>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3>Current Employees ({employees.length})</h3>
        {employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div>
            {employees.map(employee => (
              <div key={employee._id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                borderBottom: '1px solid #eee',
                backgroundColor: employee.role === 'admin' ? '#f8f9fa' : 'white'
              }}>
                <div>
                  <p style={{ margin: '0', fontWeight: 'bold' }}>{employee.name}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>{employee.email}</p>
                  <span style={{ 
                    padding: '2px 8px', 
                    backgroundColor: employee.role === 'admin' ? '#007bff' : '#28a745',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '12px'
                  }}>
                    {employee.role}
                  </span>
                </div>
                {employee._id !== user.id && (
                  <button
                    onClick={() => removeEmployee(employee._id)}
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

export default EmployeesPage;
