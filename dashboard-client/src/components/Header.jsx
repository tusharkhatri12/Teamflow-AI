import React, { useState } from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="navbar">
      <div className="logo">TeamFlow AI</div>
      <nav className={menuOpen ? 'open' : ''}>
        <ul>
          <li onClick={() => handleNavClick('features')}>Features</li>
          <li onClick={() => handleNavClick('pricing')}>Pricing</li>
          <li onClick={() => handleNavClick('waitlist')}>Early Access</li>
        </ul>
      </nav>
      <button className="signup-btn" onClick={() => navigate('/signup')}>Sign Up</button>
      <button className={`hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
};

export default Header;
