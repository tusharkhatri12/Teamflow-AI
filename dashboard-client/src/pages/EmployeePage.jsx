import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Trash2, User, Mail, Plus, Settings, UserPlus } from 'lucide-react';
import './EmployeePage.css';

const EmployeesPage = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('EmployeePage: User found, fetching data for role:', user.role);
      fetchEmployees();
    } else {
      console.log('EmployeePage: No user found');
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      console.log('EmployeePage: Starting fetch for user:', user);
      console.log('EmployeePage: User organization:', user.organization);
      
      if (!user.organization) {
        console.log('EmployeePage: No organization found for user');
        setError('No organization found for this user');
        setLoading(false);
        return;
      }
      
      const orgId = user.organization?._id || user.organization;
      console.log('EmployeePage: Fetching organization with ID:', orgId);
      
      const response = await fetch(`${apiUrl}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('EmployeePage: Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('EmployeePage: Employee data received:', data);
        setEmployees(data.members || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('EmployeePage: Failed to fetch employees:', response.status, errorData);
        setError(`Failed to fetch employees: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('EmployeePage: Error fetching employees:', err);
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
        fetchEmployees();
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

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="employee-card"
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
        className="employee-card"
      >
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading employees...</div>
      </motion.div>
    );
  }

  return (
    <div className="employee-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="employee-card"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="employee-header"
        >
          <div className="employee-header-content">
            <div className="employee-icon">
              <Users size={24} />
            </div>
            <div>
              <h1 className="employee-title">
                {user?.role === 'admin' ? 'Employee Management' : 'Team Members'}
              </h1>
              <p className="employee-subtitle">
                Manage your team members and their roles
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
              className="error-message"
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="invite-section"
          >
            <h3>
              <UserPlus size={20} />
              Invite New Employee
            </h3>
            <form onSubmit={inviteEmployee} className="invite-form">
              <div className="invite-input-group">
                <label className="invite-label">
                  Employee Email
                </label>
                <div className="invite-input-container">
                  <Mail size={20} className="invite-input-icon" />
                  <input
                    type="email"
                    placeholder="Enter employee email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="invite-input"
                    required
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={inviting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`invite-button ${inviting ? 'disabled' : ''}`}
              >
                {inviting ? (
                  <div className="loading-spinner" />
                ) : (
                  <Plus size={16} />
                )}
                {inviting ? 'Inviting...' : 'Send Invite'}
              </motion.button>
            </form>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="employees-section"
        >
          <h3>
            <Users size={20} />
            {user?.role === 'admin' ? `Current Employees (${employees.length})` : `Team Members (${employees.length})`}
          </h3>
          {employees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              <Users size={48} />
              <p>No employees found.</p>
            </motion.div>
          ) : (
            <div className="employees-grid">
              <AnimatePresence>
                {employees.map((employee, index) => (
                  <motion.div
                    key={employee._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`employee-card-item ${employee.role === 'admin' ? 'admin' : ''}`}
                  >
                    <div className="employee-info">
                      <div className={`employee-avatar ${employee.role === 'admin' ? 'admin' : ''}`}>
                        {employee.name?.charAt(0)?.toUpperCase() || employee.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="employee-details">
                        <p className="employee-name">
                          {employee.name || 'Unknown User'}
                        </p>
                        <p className="employee-email">
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <div className="employee-actions">
                      <span className={`role-badge ${employee.role === 'admin' ? 'admin' : ''}`}>
                        {employee.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {employee.role}
                      </span>
                      {user?.role === 'admin' && employee._id !== user.id && (
                        <select
                          value={employee.role}
                          onChange={(e) => changeRole(employee._id, e.target.value)}
                          className="role-select"
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {user?.role === 'admin' && employee._id !== user.id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeEmployee(employee._id)}
                          className="remove-button"
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

export default EmployeesPage;
