import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/dashboard')}
      style={{
        marginBottom: '20px',
        padding: '10px 16px',
        fontSize: '16px',
        backgroundColor: '#444',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.3s',
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = '#666')}
      onMouseLeave={(e) => (e.target.style.backgroundColor = '#444')}
    >
      ⬅ Back to Dashboard
    </button>
  );
};

export default BackButton;
