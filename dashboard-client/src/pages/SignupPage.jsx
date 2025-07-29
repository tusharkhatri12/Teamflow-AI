import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'employee',
    organizationName: '',
    joinCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Signup failed. Please check your details.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="signup-bg">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2 className="signup-title">Create your account</h2>
        <button type="button" className="google-btn" onClick={handleGoogleSignup}>
          <svg width="22" height="22" viewBox="0 0 48 48" style={{marginRight: 10}}><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.39 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.29l7.98 6.2C12.36 13.36 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.49a14.5 14.5 0 010-9.01l-7.98-6.2A23.97 23.97 0 000 24c0 3.77.9 7.34 2.69 10.51l7.98-6.02z"/><path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.15-5.59l-7.19-5.6c-2.01 1.35-4.59 2.15-7.96 2.15-6.26 0-11.64-3.86-13.33-9.49l-7.98 6.02C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Sign up with Google
        </button>
        <div className="or-divider"><span>or</span></div>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="show-hide-btn"
            onClick={() => setShowPassword(s => !s)}
            tabIndex={-1}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="role-selection">
          <label>I am a:</label>
          <div className="role-buttons">
            <button
              type="button"
              className={`role-btn ${form.role === 'employee' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'employee' })}
            >
              Employee
            </button>
            <button
              type="button"
              className={`role-btn ${form.role === 'admin' ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: 'admin' })}
            >
              Admin
            </button>
          </div>
        </div>

        {form.role === 'admin' && (
          <input
            type="text"
            name="organizationName"
            placeholder="Organization Name"
            value={form.organizationName}
            onChange={handleChange}
            required
          />
        )}

        {form.role === 'employee' && (
          <input
            type="text"
            name="joinCode"
            placeholder="Organization Join Code"
            value={form.joinCode}
            onChange={handleChange}
            required
          />
        )}

        <button className="signup-btn-main" type="submit">Sign Up</button>
        <div className="signup-footer">
          <span>Already have an account?</span>
          <button type="button" className="login-btn" onClick={() => navigate('/login')}>Login</button>
        </div>
      </form>
    </div>
  );
} 