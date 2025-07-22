import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isOpen }) => {
  const linkStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 15px",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "5px",
    transition: "background-color 0.2s ease",
  };

  const activeStyle = {
    backgroundColor: "#333",
  };

  return (
    <aside style={{
      width: isOpen ? "220px" : "0",
      overflow: "hidden",
      backgroundColor: "#121212",
      transition: "width 0.3s ease-in-out",
      padding: isOpen ? "20px" : "0",
    }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <NavLink to="/summaries" style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {})
          })}>
            📄 Summaries
          </NavLink>
        </li>
        <li>
          <NavLink to="/messages" style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {})
          })}>
            💬 Messages
          </NavLink>
        </li>
        <li>
          <NavLink to="/memory" style={({ isActive }) => ({
            ...linkStyle,
            ...(isActive ? activeStyle : {})
          })}>
            🧠 Memory
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
