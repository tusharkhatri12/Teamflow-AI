import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import "./index.css";

function AppContent({ theme, setTheme, user, onLogout }) {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/"].includes(location.pathname);
  const isLandingPage = location.pathname === "/" || location.pathname === "/landingpage";

  return (
    <div className={`app ${theme}`}>
      {!isAuthPage && <Sidebar isOpen={true} user={user} onLogout={onLogout} />}
      {isLandingPage && <Header setTheme={setTheme} />}
      <main className="main">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/summaries" element={<SummariesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/organizations" element={<OrganizationsPage user={user} />} />
          <Route path="/employees" element={<EmployeePage user={user} />} />
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
  const [user, setUser] = useState({
    _id: "user123",
    name: "John Doe",
    email: "john@example.com",
    role: "admin", // or "employee"
    organizationId: "org123",
  });

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <AppContent theme={theme} setTheme={setTheme} user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
};

export default App;
