import React, { useState } from 'react';
import ScanForm from './components/ScanForm';
import ResultView from './components/ResultView';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo" aria-hidden>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Phishing Detection</h1>
          <p className="tagline">Scan URLs, email content, and attachments with ML and threat intelligence.</p>
        </div>
      </header>
      <main className="container">
        <div className="layout">
          <div className="pane">
            <h2 className="panel-title">New scan</h2>
            <ScanForm onResult={(r) => setResult(r)} />
          </div>
          <div className="pane">
            <ResultView result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}
