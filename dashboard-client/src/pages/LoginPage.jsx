import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new CustomEvent('userStateChanged', { detail: { user: data.user } }));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
          }}>
            Welcome back
          </h1>
          <p style={{
            color: '#666',
            fontSize: '16px',
            margin: 0,
          }}>
            Sign in to your TeamFlow account
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '14px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
            transition: 'all 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.39 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.29l7.98 6.2C12.36 13.36 17.74 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/>
            <path fill="#FBBC05" d="M10.67 28.49a14.5 14.5 0 010-9.01l-7.98-6.2A23.97 23.97 0 000 24c0 3.77.9 7.34 2.69 10.51l7.98-6.02z"/>
            <path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.15-5.59l-7.19-5.6c-2.01 1.35-4.59 2.15-7.96 2.15-6.26 0-11.64-3.86-13.33-9.49l-7.98 6.02C6.71 42.18 14.82 48 24 48z"/>
          </svg>
          Continue with Google
        </motion.button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{
            padding: '0 16px',
            color: '#9ca3af',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            or
          </span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: '20px' }}
          >
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Mail size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af' }} />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}>
              <Lock size={20} style={{ position: 'absolute', left: '16px', color: '#9ca3af' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  background: '#fff',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #fff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Sign up
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
} 