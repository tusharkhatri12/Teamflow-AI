import React from "react";
import { NavLink } from "react-router-dom";
import './Sidebar.css';

const sections = [
  { label: 'Profile', icon: '👤', path: '/profile' },
  { label: 'Settings', icon: '⚙️', path: '/settings' },
  { label: 'API & Webhooks', icon: '🔗', path: '/api-webhooks' },
  { label: 'Support', icon: '💬', path: '/support' },
  { label: 'FAQs', icon: '❓', path: '/faqs' },
];

const Sidebar = ({ isOpen, user, onLogout }) => {
  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>
      <div className="sidebar-profile">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'U')}&background=0D8ABC&color=fff&size=64`}
          alt="Profile"
          className="sidebar-avatar"
        />
        <span className="sidebar-username">{user?.name || user?.email}</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {sections.map(section => (
            <li key={section.label}>
              <NavLink to={section.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="sidebar-icon">{section.icon}</span>
                <span className="sidebar-label">{section.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <button className="sidebar-logout" onClick={onLogout}>
        <span className="sidebar-icon">🚪</span> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
