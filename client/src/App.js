import React, { useState } from 'react';
import ScanForm from './components/ScanForm';
import ResultView from './components/ResultView';
import './App.css';

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="container">
      <h1>Phishing Detection — Demo</h1>
      <div className="layout">
        <div className="pane">
          <ScanForm onResult={(r) => setResult(r)} />
        </div>
        <div className="pane">
          <ResultView result={result} />
        </div>
      </div>
    </div>
  );
}
