import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, guestSessionId } = useContext(AuthContext);
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleExpand = (id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    let url = '/api/logs';
    if (!token && guestSessionId) {
      url += `?guestSessionId=${guestSessionId}`;
    }

    fetch(url, { headers })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setLogs(data.logs);
        } else {
          setError(data.error || 'Failed to fetch logs');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="pane">
        <div className="panel-bar">
          <span className="panel-title">// logs_loading</span>
        </div>
        <div className="panel-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pane">
        <div className="panel-bar">
          <span className="panel-title">// logs_error</span>
        </div>
        <div className="panel-body">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pane">
      <div className="panel-bar">
        <span className="panel-title">// scan_history</span>
        <div className="window-dots" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
      <div className="panel-body" style={{ padding: '0' }}>
        {logs.length === 0 ? (
          <div className="idle-text" style={{ textAlign: 'center', padding: '40px' }}>
            NO LOGS FOUND IN DATABASE
          </div>
        ) : (
          <div className="logs-table-wrap">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>TYPE</th>
                  <th>TARGET</th>
                  <th>RESULT</th>
                  <th>SCORE</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td style={{ textTransform: 'uppercase', color: 'var(--text2)' }}>{log.inputType}</td>
                    <td 
                      className="log-target" 
                      title={log.raw}
                      onClick={() => toggleExpand(log._id)}
                      style={{ 
                        cursor: 'pointer', 
                        whiteSpace: expandedLogs[log._id] ? 'pre-wrap' : 'nowrap',
                        wordBreak: expandedLogs[log._id] ? 'break-all' : 'normal',
                        maxWidth: expandedLogs[log._id] ? 'none' : '300px'
                      }}
                    >
                      {expandedLogs[log._id] || log.raw.length <= 50 ? log.raw : log.raw.substring(0, 50) + '...'}
                    </td>
                    <td>
                      <span className={`log-badge log-${log.result}`}>
                        {log.result}
                      </span>
                    </td>
                    <td>
                      <span className={log.riskScore > 50 ? 'text-danger' : log.riskScore > 20 ? 'text-warn' : 'text-safe'}>
                        {log.riskScore}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
