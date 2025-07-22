import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import SummariesPage from "./pages/SummariesPage";
import MessagesPage from "./pages/MessagesPage";
import MemoryPage from "./pages/MemoryPage";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import "./index.css";

function AppContent({ theme, setTheme }) {
  const location = useLocation();
  const showHeader = ["/", "/landingpage"].includes(location.pathname);
  return (
    <div className={`app ${theme}`}>
      {showHeader && <Header setTheme={setTheme} />}
      <div className="container">
        <main className="main">
          <Routes>
            <Route path="/summaries" element={<SummariesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

const App = () => {
  const [theme, setTheme] = useState("dark"); // default theme
  return (
    <BrowserRouter>
      <AppContent theme={theme} setTheme={setTheme} />
    </BrowserRouter>
  );
};

export default App;
