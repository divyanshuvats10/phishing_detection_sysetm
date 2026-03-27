import React, { useState } from 'react';
import { postScan } from '../services/api';

export default function ScanForm({ onResult }) {
  const [inputType, setInputType] = useState('url');
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e && e.preventDefault();
    setError(null);
    setLoading(true);
    onResult(null);
    try {
      const res = await postScan({ inputType, raw });
      onResult(res);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="scan-form">
      <label>Type</label>
      <select value={inputType} onChange={(e) => setInputType(e.target.value)}>
        <option value="url">URL</option>
        <option value="email">Email</option>
        <option value="attachment">Attachment</option>
      </select>

      <label>Input</label>
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={8} />

      <div className="row">
        <button type="submit" disabled={loading}> {loading ? 'Scanning...' : 'Scan'} </button>
        <button type="button" onClick={() => { setRaw(''); onResult(null); }} className="muted">Clear</button>
      </div>

      {error && <div className="error">{error}</div>}
    </form>
  );
}
