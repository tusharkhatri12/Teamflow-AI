import React, { useState, useEffect } from 'react';
import './EmployeePage.css';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch('/api/org/employees', {
      headers: { Authorization: localStorage.getItem('token') }
    })
      .then(res => res.json())
      .then(data => setEmployees(data));
  }, []);

  const removeUser = async (id) => {
    await fetch(`/api/org/remove/${id}`, {
      method: 'DELETE',
      headers: { Authorization: localStorage.getItem('token') }
    });
    setEmployees(employees.filter(user => user._id !== id));
  };

  return (
    <div className="employees-container">
      <h2>Employees</h2>
      <ul>
        {employees.map(user => (
          <li key={user._id}>
            <span>{user.name || user.email}</span>
            <span>{user.role}</span>
            {user.role !== 'admin' && (
              <button onClick={() => removeUser(user._id)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeesPage;
