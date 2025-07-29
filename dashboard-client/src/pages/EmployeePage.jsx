import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, Trash2, User, Mail, Plus, Settings, UserPlus } from 'lucide-react';

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
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading employees...</div>
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Users size={24} />
            </div>
            <div>
              <h1 style={{ 
                color: '#1a1a1a',
                margin: 0,
                fontSize: '28px',
                fontWeight: '700'
              }}>
                {user?.role === 'admin' ? 'Employee Management' : 'Team Members'}
              </h1>
              <p style={{ 
                color: '#6b7280',
                margin: '4px 0 0 0',
                fontSize: '16px'
              }}>
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

        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
              padding: '24px', 
              borderRadius: '16px', 
              marginBottom: '32px',
              border: '1px solid #bbf7d0'
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
              <UserPlus size={20} />
              Invite New Employee
            </h3>
            <form onSubmit={inviteEmployee} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '300px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Employee Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="email"
                    placeholder="Enter employee email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: '#fff',
                      transition: 'all 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    required
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={inviting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '16px 24px',
                  background: inviting ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: inviting ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px',
                  justifyContent: 'center',
                }}
              >
                {inviting ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
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
            {user?.role === 'admin' ? `Current Employees (${employees.length})` : `Team Members (${employees.length})`}
          </h3>
          {employees.length === 0 ? (
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
              <p style={{ fontSize: '16px', margin: 0 }}>No employees found.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              <AnimatePresence>
                {employees.map((employee, index) => (
                  <motion.div
                    key={employee._id}
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
                      background: employee.role === 'admin' ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: employee.role === 'admin' 
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
                        {employee.name?.charAt(0)?.toUpperCase() || employee.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          fontWeight: '600',
                          color: '#1a1a1a',
                          fontSize: '16px'
                        }}>
                          {employee.name || 'Unknown User'}
                        </p>
                        <p style={{ 
                          margin: '0', 
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {employee.email}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        background: employee.role === 'admin' 
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
                        {employee.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                        {employee.role}
                      </span>
                      {user?.role === 'admin' && employee._id !== user.id && (
                        <select
                          value={employee.role}
                          onChange={(e) => changeRole(employee._id, e.target.value)}
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
                      {user?.role === 'admin' && employee._id !== user.id && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeEmployee(employee._id)}
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

export default EmployeesPage;
