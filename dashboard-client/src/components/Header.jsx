import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import './Header.css';

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

const navLinks = [
  { label: 'Features', id: 'features' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Early Access', id: 'waitlist' },
];

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.header
      className="navbar glassy"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80, damping: 16 } }}
      style={{
        background: 'rgba(24,26,32,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(37,99,235,0.08)',
      }}
    >
      <div className="logo" style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: '#fff' }}>
        <span style={{ color: '#2563eb' }}>Team</span>Flow
      </div>
      <nav className={menuOpen ? 'open' : ''}>
        <ul>
          {navLinks.map((link, idx) => (
            <motion.li
              key={link.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * idx } }}
              whileHover={{ scale: 1.08, color: '#2563eb' }}
              onClick={() => handleNavClick(link.id)}
              style={{ color: '#fff', fontWeight: 500, fontSize: 17, cursor: 'pointer' }}
            >
              {link.label}
            </motion.li>
          ))}
        </ul>
      </nav>
      <motion.button
        className="signup-btn"
        whileHover={{ scale: 1.06, backgroundColor: '#2563eb', color: '#fff', borderColor: '#2563eb' }}
        onClick={() => navigate('/signup')}
        style={{ fontWeight: 600, fontSize: 16 }}
      >
        Sign Up
      </motion.button>
      <button
        className={`hamburger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(m => !m)}
        aria-label="Toggle menu"
        style={{ background: 'none', border: 'none', color: '#fff' }}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.45)',
              zIndex: 999,
            }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
