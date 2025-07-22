import React from 'react';
import './Header.css';
import { useNavigate } from 'react-router-dom';

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const Header = () => {
  const navigate = useNavigate();
  return (
  <header className="navbar">
        <div className="logo">TeamFlow AI</div>
        <nav>
          <ul>
            <li onClick={() => scrollToSection('features')}>Features</li>
            <li onClick={() => scrollToSection('pricing')}>Pricing</li>
            <li onClick={() => scrollToSection('waitlist')}>Early Access</li>
          </ul>
        </nav>
        <button className="signup-btn" onClick={() => navigate('/signup')}>Sign Up</button>
      </header>
  );
};

export default Header;
