import React from "react";
import { NavLink } from "react-router-dom";
import './Sidebar.css';

const sections = [
  { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
  { label: 'Summaries', icon: '📄', path: '/summaries' },
  { label: 'Messages', icon: '💬', path: '/messages' },
  { label: 'Memory', icon: '🧠', path: '/memory' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
];

const adminSections = [
  { label: 'Organizations', icon: '🏢', path: '/organizations' },
  { label: 'Employees', icon: '👥', path: '/employees' },
];

const Sidebar = ({ isOpen, user, onLogout, onToggle }) => {
  return (
    <aside className={`sidebar-modern${isOpen ? ' open' : ' collapsed'}`}> 
      <div className="sidebar-header">
        <div className="sidebar-logo">TeamFlow AI</div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <div className="sidebar-modern-user">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'U')}&background=23272f&color=fff&size=64`}
          alt="Profile"
          className="sidebar-modern-avatar"
        />
        <span className="sidebar-modern-username">{user?.name || user?.email}</span>
      </div>

      <nav className="sidebar-nav-modern">
        <ul>
          {sections.map(section => (
            <li key={section.label}>
              <NavLink to={section.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-modern-icon">{section.icon}</span>
                <span className="sidebar-modern-label">{section.label}</span>
              </NavLink>
            </li>
          ))}

          {/* Admin-only links */}
          {user?.role === 'admin' && adminSections.map(section => (
            <li key={section.label}>
              <NavLink to={section.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-modern-icon">{section.icon}</span>
                <span className="sidebar-modern-label">{section.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button className="sidebar-modern-logout" onClick={onLogout}>
        <span className="sidebar-modern-icon">🚪</span> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
