import React, { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ScanForm from './components/ScanForm';
import ResultView from './components/ResultView';
import LogsPage from './components/LogsPage';
import AwarenessPage from './components/AwarenessPage';
import GamePage from './components/GamePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';

function AppContent() {
  const [result, setResult] = useState(null);
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">

      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" aria-hidden />

      <header className="app-header">
        <div className="app-header__inner">

          <div className="header-left">
            <Link to="/" className="app-logo" aria-hidden style={{ textDecoration: 'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div className="header-text">
              <div className="sys-label">// sys::threat-analysis v2.4.1</div>
              <h1 className="header-title">
                <span className="title-accent">PHISH</span>CEASE
              </h1>
              <p className="tagline">
                ml-powered phishing detection · url · email · attachment
              </p>
            </div>
          </div>

          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <nav className="header-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>// SCANNER</Link>
                <Link to="/logs" className={`nav-link ${path === '/logs' ? 'active' : ''}`}>// LOGS</Link>
                <Link to="/awareness" className={`nav-link ${path === '/awareness' ? 'active' : ''}`}>// AWARENESS</Link>
                <Link to="/training" className={`nav-link ${path === '/training' ? 'active' : ''}`}>// TRAINING</Link>
                <div className="nav-divider" style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }}></div>
                {user ? (
                  <>
                    <span style={{ color: 'var(--text2)', fontSize: '13px', textTransform: 'uppercase' }}>OP: {user.name}</span>
                    <button className="nav-link" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>// LOGOUT</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={`nav-link ${path === '/login' ? 'active' : ''}`}>// LOGIN</Link>
                    <Link to="/register" className={`nav-link ${path === '/register' ? 'active' : ''}`}>// REGISTER</Link>
                  </>
                )}
              </nav>
              <div className="status-dot">
                <span className="dot" aria-hidden />
                ONLINE
              </div>
            </div>
          </div>

        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={
            <div className="layout">
              <div className="pane">
                <div className="panel-bar">
                  <span className="panel-title">// new_scan</span>
                  <div className="window-dots" aria-hidden>
                    <span /><span /><span />
                  </div>
                </div>
                <div className="panel-body">
                  <ScanForm onResult={(r) => setResult(r)} />
                </div>
              </div>

              <div className="pane">
                <div className="panel-bar">
                  <span className="panel-title">// analysis_output</span>
                  <div className="window-dots" aria-hidden>
                    <span /><span /><span />
                  </div>
                </div>
                <div className="panel-body">
                  <ResultView result={result} />
                </div>
              </div>
            </div>
          } />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/awareness" element={<AwarenessPage />} />
          <Route path="/training" element={<GamePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
