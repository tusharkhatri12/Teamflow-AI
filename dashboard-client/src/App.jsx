import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SummariesPage from "./pages/SummariesPage";
import MessagesPage from "./pages/MessagesPage";
import MemoryPage from "./pages/MemoryPage";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import OrganizationsPage from "./pages/OrganizationPages";
import EmployeePage from "./pages/EmployeePage";
import JoinOrganization from "./pages/JoinOrganization";
import "./index.css";

function AppContent({ theme, setTheme, user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  const isLandingPage = location.pathname === "/" || location.pathname === "/landingpage";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch custom event to notify sidebar of user change
    window.dispatchEvent(new CustomEvent('userStateChanged', { detail: { user: null } }));
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className={`app ${theme}`}>
      {!isAuthPage && <Sidebar isOpen={sidebarOpen} user={user} onLogout={handleLogout} onToggle={handleSidebarToggle} />}
      {isLandingPage && <Header setTheme={setTheme} />}
      <main className={`main ${!isAuthPage && sidebarOpen ? 'sidebar-open' : ''}`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/summaries" element={<SummariesPage user={user} />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/organizations" element={<OrganizationsPage user={user} />} />
          <Route path="/employees" element={<EmployeePage user={user} />} />
          <Route path="/join-organization" element={<JoinOrganization />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Listen for storage changes and custom events to update user state
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    const handleUserStateChange = (event) => {
      setUser(event.detail.user);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userStateChanged', handleUserStateChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userStateChanged', handleUserStateChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppContent theme={theme} setTheme={setTheme} user={user} />
    </BrowserRouter>
  );
};

export default App;
