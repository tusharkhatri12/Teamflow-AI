import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  Building,
  FileText,
  MessageCircle,
  Brain,
  KanbanSquare,
  LogOut,
  Menu
} from 'lucide-react';
import './Sidebar.css';

const navIcons = {
  dashboard: <Home size={22} />, // Home
  summaries: <FileText size={22} />, // FileText
  messages: <MessageCircle size={22} />, // MessageCircle
  memory: <Brain size={22} />, // Brain
  organizations: <Building size={22} />, // Building
  employees: <Users size={22} />, // Users
  board: <KanbanSquare size={22} />,
};

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: navIcons.dashboard },
  { path: '/summaries', label: 'Summaries', icon: navIcons.summaries },
  { path: '/messages', label: 'Messages', icon: navIcons.messages },
  { path: '/memory', label: 'Memory', icon: navIcons.memory },
  { path: '/organizations', label: 'Organization', icon: navIcons.organizations },
  { path: '/employees', label: 'Employees', icon: navIcons.employees },
  { path: '/board', label: 'Board', icon: navIcons.board },
];

const Sidebar = ({ user, onLogout, isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // On mobile, always start with menu closed
      if (mobile) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Sidebar animation variants
  const sidebarVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
    exit: { x: '-100%', transition: { type: 'spring', stiffness: 120, damping: 18 } },
  };

  // Nav item animation
  const navItemVariants = {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
  };

  // Determine if sidebar should be visible
  const shouldShowSidebar = isMobile ? mobileMenuOpen : isOpen;

  return (
    <>
      {/* Hamburger Menu - Show on all screens */}
      <button 
        className={`hamburger-menu ${isMobile ? 'mobile' : 'desktop'} ${(isMobile ? mobileMenuOpen : isOpen) ? 'active' : ''}`}
        onClick={isMobile ? handleMobileToggle : onToggle}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.aside
            className={`sidebar-modern glassy ${isMobile ? 'mobile' : (isOpen ? 'open' : 'collapsed')}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={sidebarVariants}
            key="sidebar"
            style={{
              boxShadow: '0 8px 32px rgba(37,99,235,0.10)',
              background: 'rgba(24,26,32,0.92)',
              backdropFilter: 'blur(12px)',
              borderRight: '1.5px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="sidebar-header flex-between">
              <div className="sidebar-logo" style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
                <span style={{ color: '#2563eb' }}>Team</span>Flow
              </div>
            </div>
            <div className="sidebar-modern-user flex gap-2">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'U')}&background=23272f&color=fff&size=64`}
                alt="Profile"
                className="sidebar-modern-avatar"
              />
              <span className="sidebar-modern-username">{user?.name || user?.email}</span>
            </div>
            <nav className="sidebar-nav-modern">
              <ul>
                <AnimatePresence>
                  {navItems.map((item, idx) => (
                    <motion.li
                      key={item.path}
                      variants={navItemVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ delay: 0.03 * idx }}
                    >
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          handleNavClick(item.path);
                        }}
                        className={location.pathname === item.path ? 'active' : ''}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          fontWeight: 500,
                          fontSize: 16,
                          color: location.pathname === item.path ? '#2563eb' : '#bfc9d4',
                          background: location.pathname === item.path ? 'rgba(37,99,235,0.08)' : 'none',
                          borderRadius: 8,
                          padding: '12px 18px',
                          margin: '2px 0',
                          transition: 'background 0.18s, color 0.18s',
                        }}
                      >
                        <span className="sidebar-modern-icon">{item.icon}</span>
                        <span className="sidebar-modern-label">{item.label}</span>
                      </a>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </nav>
            <motion.button
              className="sidebar-modern-logout flex gap-1"
              onClick={handleLogoutClick}
              whileHover={{ scale: 1.05, backgroundColor: '#ef4444', color: '#fff' }}
              style={{ margin: '1.5em 1em 1em 1em', background: '#23272f', color: '#bfc9d4', fontWeight: 500 }}
            >
              <LogOut size={20} />
              <span className="sidebar-modern-label">Logout</span>
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
