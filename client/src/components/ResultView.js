import React from 'react';

function prettyJSON(obj) {
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

export default function ResultView({ result }) {
  if (!result) {
    return <div className="placeholder">No result yet. Submit text or URL to scan.</div>;
  }

  const log = result.log || {};

  const download = () => {
    const blob = new Blob([prettyJSON(result)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-view">
      <h2>Scan Result</h2>
      <div className="kv"><strong>Classification:</strong> <span>{log.result}</span></div>
      <div className="kv"><strong>Risk Score:</strong> <span>{log.riskScore}</span></div>
      <div className="kv"><strong>Input Type:</strong> <span>{log.inputType}</span></div>
      <div className="section">
        <strong>Meta</strong>
        <pre className="meta">{prettyJSON(log.meta)}</pre>
      </div>

      <div className="section">
        <strong>Full Response</strong>
        <pre className="full">{prettyJSON(result)}</pre>
      </div>

      <div className="row">
        <button onClick={download}>Download JSON</button>
      </div>
    </div>
  );
}
