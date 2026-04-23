import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ScanForm from './components/ScanForm';
import ResultView from './components/ResultView';
import LogsPage from './components/LogsPage';
import AwarenessPage from './components/AwarenessPage';
import './App.css';

function AppContent() {
  const [result, setResult] = useState(null);
  const location = useLocation();
  const path = location.pathname;

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
                <span className="title-accent">PHISH</span>GUARD
              </h1>
              <p className="tagline">
                ml-powered phishing detection · url · email · attachment
              </p>
            </div>
          </div>

          <div className="header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <nav className="header-nav" style={{ display: 'flex', gap: '12px' }}>
                <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>// SCANNER</Link>
                <Link to="/logs" className={`nav-link ${path === '/logs' ? 'active' : ''}`}>// LOGS</Link>
                <Link to="/awareness" className={`nav-link ${path === '/awareness' ? 'active' : ''}`}>// AWARENESS</Link>
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
        </Routes>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
