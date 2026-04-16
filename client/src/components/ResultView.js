import React from 'react';

function prettyJSON(obj) {
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

function classificationBadgeClass(result) {
  const key = String(result || '').toLowerCase();
  if (key === 'phishing') return 'badge badge--phishing';
  if (key === 'legitimate') return 'badge badge--legitimate';
  if (key === 'unknown') return 'badge badge--unknown';
  if (key.includes('phish')) return 'badge badge--phishing';
  if (key.includes('legit') || key.includes('safe') || key.includes('benign')) return 'badge badge--legitimate';
  return 'badge badge--unknown';
}

export default function ResultView({ result }) {
  if (!result) {
    return (
      <>
        <h2 className="panel-title">Results</h2>
        <div className="placeholder">No result yet. Run a scan to see classification, risk score, and raw details.</div>
      </>
    );
  }

  const log = result.log || {};
  const vt = log.meta && log.meta.virusTotal;

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
      <h2 className="panel-title">Results</h2>
      <div className="result-hero">
        <span className={classificationBadgeClass(log.result)} title="Classification">
          {log.result ?? '—'}
        </span>
        <div className="score-pill">
          <span className="score-pill__label">Risk score</span>
          <span className="score-pill__value">{log.riskScore ?? '—'}</span>
        </div>
      </div>
      <dl className="dl-grid">
        <div>
          <dt>Input type</dt>
          <dd>{log.inputType ?? '—'}</dd>
        </div>
      </dl>

      {vt && (
        <div className="section virus-total-block">
          <strong>VirusTotal</strong>
          {vt.summary && (
            <div className="vt-summary">
              <div className="kv">
                <strong>Verdict:</strong>{' '}
                <span className={`vt-verdict vt-verdict--${vt.summary.verdict || 'unknown'}`}>
                  {vt.summary.label}
                </span>
              </div>
              <p className="vt-short">{vt.summary.shortMessage}</p>
              <p className="vt-detail">{vt.summary.detail}</p>
              {vt.stats && (
                <p className="vt-stats-plain">
                  Engines: {vt.stats.malicious} malicious, {vt.stats.suspicious} suspicious,{' '}
                  {vt.stats.harmless + vt.stats.undetected} harmless/undetected
                  {vt.stats.timeout ? `, ${vt.stats.timeout} timed out` : ''}.
                </p>
              )}
            </div>
          )}
          {!vt.summary && vt.userMessage && <p className="vt-user-msg">{vt.userMessage}</p>}
          {vt.ok && !vt.summary && !vt.userMessage && (
            <p className="vt-detail">VirusTotal responded; see raw details in Meta below or open the full report.</p>
          )}
          {vt.hint && <p className="vt-hint">{vt.hint}</p>}
          {vt.permalink && (
            <p className="vt-link">
              <a href={vt.permalink} target="_blank" rel="noopener noreferrer">
                Open full report on VirusTotal
              </a>
            </p>
          )}
        </div>
      )}

      <div className="section">
        <span className="section-title">Meta</span>
        <pre className="meta">{prettyJSON(log.meta)}</pre>
      </div>

      <div className="section">
        <span className="section-title">Full response</span>
        <pre className="full">{prettyJSON(result)}</pre>
      </div>

      <div className="row">
        <button type="button" className="btn-outline" onClick={download}>
          Download JSON
        </button>
      </div>
    </div>
  );
}
