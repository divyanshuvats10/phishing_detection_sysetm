import React from 'react';

function prettyJSON(obj) {
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
}

function verdictLevel(result) {
  const key = String(result || '').toLowerCase();
  if (key === 'phishing' || key.includes('phish')) return 'danger';
  if (key === 'legitimate' || key.includes('legit') || key.includes('safe') || key.includes('benign')) return 'safe';
  return 'warn';
}

function verdictLabel(result) {
  const level = verdictLevel(result);
  if (level === 'danger') return 'THREAT DETECTED';
  if (level === 'safe')   return 'CLEAN';
  return 'SUSPICIOUS';
}

function vtLevelClass(vtVerdict) {
  const v = String(vtVerdict || '').toLowerCase();
  if (v === 'malicious')  return 'danger';
  if (v === 'suspicious') return 'warn';
  if (v === 'harmless' || v === 'clean') return 'safe';
  return 'neutral';
}

function scoreLevel(score) {
  if (score == null) return 'neutral';
  if (score >= 70) return 'danger';
  if (score >= 35) return 'warn';
  return 'safe';
}

const VerdictIcon = ({ level }) => {
  if (level === 'safe') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
  if (level === 'danger') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
};

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ExternalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

function IdleState() {
  const cells = Array.from({ length: 18 }, (_, i) => ({
    lit: [1, 3, 5, 8, 11, 14, 16].includes(i),
    cls: i % 5 === 0 ? ' c2' : i % 3 === 0 ? ' c3' : '',
  }));

  return (
    <div className="result-idle">
      <div className="idle-grid">
        {cells.map((c, i) => (
          <div key={i} className={`idle-cell${c.lit ? ' lit' + c.cls : ''}`} />
        ))}
      </div>
      <span className="idle-text">
        awaiting input<span className="blink">_</span>
      </span>
    </div>
  );
}

function download(result) {
  const blob = new Blob([prettyJSON(result)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'scan-report.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ResultView({ result }) {
  if (!result) return <IdleState />;

  const log   = result.log || {};
  const vt    = log.meta && log.meta.virusTotal;
  const level = verdictLevel(log.result);
  const score = log.riskScore;
  const sLvl  = scoreLevel(score);

  const now = new Date();
  const ts  = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':');

  return (
    <div className="result-view">

      {/* ── Verdict header ── */}
      <div className="verdict">
        <div className={`verdict-header ${level}`}>
          <VerdictIcon level={level} />
          {verdictLabel(log.result)}
        </div>
        <div className="verdict-body">
          <div className={`verdict-score ${sLvl}`}>
            {score ?? '—'}
            <span className="verdict-score-denom">/100</span>
          </div>
          <div className="verdict-desc">
            risk score · {log.inputType ?? '—'}
          </div>
          <div className="score-bar-wrap">
            <div
              className={`score-bar-fill ${sLvl}`}
              style={{ width: `${score ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── VirusTotal block ── */}
      {vt && (
        <div className="vt-block">
          <div className="section-header">
            <span className="section-title">// virustotal</span>
            {vt.permalink && (
              <a
                href={vt.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="vt-ext-link"
              >
                full report <ExternalIcon />
              </a>
            )}
          </div>

          {vt.summary && (
            <>
              <div className="vt-verdict-row">
                <span className={`verdict-chip ${vtLevelClass(vt.summary.verdict)}`}>
                  {vt.summary.label}
                </span>
                <span className="vt-short-msg">{vt.summary.shortMessage}</span>
              </div>

              {vt.summary.detail && (
                <p className="vt-detail">{vt.summary.detail}</p>
              )}

              {vt.stats && (
                <div className="vt-stats-grid">
                  <div className={`vt-stat ${vt.stats.malicious > 0 ? 'bad' : 'neutral'}`}>
                    <span className="vt-stat-val">{vt.stats.malicious}</span>
                    <span className="vt-stat-lbl">malicious</span>
                  </div>
                  <div className={`vt-stat ${vt.stats.suspicious > 0 ? 'warn' : 'neutral'}`}>
                    <span className="vt-stat-val">{vt.stats.suspicious}</span>
                    <span className="vt-stat-lbl">suspicious</span>
                  </div>
                  <div className="vt-stat neutral">
                    <span className="vt-stat-val">
                      {(vt.stats.harmless ?? 0) + (vt.stats.undetected ?? 0)}
                    </span>
                    <span className="vt-stat-lbl">harmless</span>
                  </div>
                  {vt.stats.timeout > 0 && (
                    <div className="vt-stat neutral">
                      <span className="vt-stat-val">{vt.stats.timeout}</span>
                      <span className="vt-stat-lbl">timeout</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!vt.summary && vt.userMessage && (
            <p className="vt-user-msg">{vt.userMessage}</p>
          )}

          {vt.hint && <p className="vt-hint">{vt.hint}</p>}
        </div>
      )}

      {/* ── Activity log ── */}
      <div className="log-block">
        <div className="log-line">
          <span className="log-ts">[{ts}]</span>
          <span className="log-msg ok">scan complete</span>
        </div>
        <div className="log-line">
          <span className="log-ts">[{ts}]</span>
          <span className={`log-msg ${level === 'danger' ? 'err' : level === 'warn' ? 'warn' : 'ok'}`}>
            classification → {log.result ?? 'unknown'}
          </span>
        </div>
        {vt?.stats && (
          <div className="log-line">
            <span className="log-ts">[{ts}]</span>
            <span className="log-msg">
              vt engines: {vt.stats.malicious}M / {vt.stats.suspicious}S / {(vt.stats.harmless ?? 0) + (vt.stats.undetected ?? 0)}H
            </span>
          </div>
        )}
      </div>

      {/* ── Raw sections ── */}
      <details className="raw-section">
        <summary className="raw-summary">// meta</summary>
        <pre className="raw-pre">{prettyJSON(log.meta)}</pre>
      </details>

      <details className="raw-section">
        <summary className="raw-summary">// full response</summary>
        <pre className="raw-pre">{prettyJSON(result)}</pre>
      </details>

      {/* ── Download ── */}
      <div className="row">
        <button type="button" className="btn-download" onClick={() => download(result)}>
          <DownloadIcon /> Download JSON
        </button>
      </div>

    </div>
  );
}
