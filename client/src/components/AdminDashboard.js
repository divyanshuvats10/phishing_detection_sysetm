import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('logs');
  
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [error, setError] = useState('');
  const [expandedLogs, setExpandedLogs] = useState({});

  const toggleExpand = (id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchLogs = async (page = 1) => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`/api/admin/logs?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setLogs(data.logs);
        setLogsPage(data.page);
        setLogsTotalPages(data.totalPages);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error fetching logs');
    }
    setLoadingLogs(false);
  };

  const fetchUsers = async (page = 1) => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users);
        setUsersPage(data.page);
        setUsersTotalPages(data.totalPages);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error fetching users');
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (token && user?.role === 'admin') {
      if (activeTab === 'logs') fetchLogs(logsPage);
      if (activeTab === 'users') fetchUsers(usersPage);
    }
  }, [activeTab, token, user, logsPage, usersPage]);

  const deleteLog = async (id) => {
    if (!window.confirm('Delete this log permanently?')) return;
    try {
      const res = await fetch(`/api/admin/logs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        fetchLogs(logsPage);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting log');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        fetchUsers(usersPage);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="pane">
        <div className="panel-bar"><span className="panel-title">// access_denied</span></div>
        <div className="panel-body"><div className="error">UNAUTHORIZED. Admin clearance required.</div></div>
      </div>
    );
  }

  return (
    <div className="pane" style={{ minHeight: '600px' }}>
      <div className="panel-bar">
        <span className="panel-title">// global_oversight</span>
        <div className="window-dots" aria-hidden>
          <span /><span /><span />
        </div>
      </div>
      
      <div className="tab-group" role="tablist" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}>
        <button
          type="button" role="tab"
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          System Logs
        </button>
        <button
          type="button" role="tab"
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Operatives Roster
        </button>
      </div>

      <div className="panel-body" style={{ padding: '0' }}>
        {error && <div className="error" style={{ margin: '14px' }}>{error}</div>}

        {activeTab === 'logs' && (
          <>
            {loadingLogs ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ display: 'inline-block' }} /></div>
            ) : (
              <div className="logs-table-wrap">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>INITIATOR</th>
                      <th>TYPE</th>
                      <th>TARGET</th>
                      <th>RESULT</th>
                      <th>SCORE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                        <td style={{ color: log.user ? 'var(--blue)' : 'var(--text2)' }}>
                          {log.user ? `${log.user.name} (${log.user.email})` : `Guest [${log.guestSessionId?.substring(0, 8)}]`}
                        </td>
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
                          {expandedLogs[log._id] || log.raw.length <= 30 ? log.raw : log.raw.substring(0, 30) + '...'}
                        </td>
                        <td>
                          <span className={`log-badge log-${log.result}`}>{log.result}</span>
                        </td>
                        <td>
                          <span className={log.riskScore > 50 ? 'text-danger' : log.riskScore > 20 ? 'text-warn' : 'text-safe'}>
                            {log.riskScore}/100
                          </span>
                        </td>
                        <td>
                          <button onClick={() => deleteLog(log._id)} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', cursor: 'pointer', padding: '2px 6px', fontSize: '10px' }}>DEL</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <button disabled={logsPage <= 1} onClick={() => setLogsPage(p => p - 1)} className="muted" style={{ padding: '6px 12px' }}>PREV</button>
              <span style={{ fontSize: '12px', color: 'var(--text2)', alignSelf: 'center' }}>PAGE {logsPage} / {logsTotalPages}</span>
              <button disabled={logsPage >= logsTotalPages} onClick={() => setLogsPage(p => p + 1)} className="muted" style={{ padding: '6px 12px' }}>NEXT</button>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            {loadingUsers ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ display: 'inline-block' }} /></div>
            ) : (
              <div className="logs-table-wrap">
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>JOINED</th>
                      <th>ALIAS</th>
                      <th>EMAIL</th>
                      <th>ROLE</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{new Date(u.createdAt).toLocaleString()}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span style={{ color: u.role === 'admin' ? 'var(--amber)' : 'var(--text)', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold' }}>{u.role}</span>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button onClick={() => deleteUser(u._id)} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', cursor: 'pointer', padding: '2px 6px', fontSize: '10px' }}>DEL</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
              <button disabled={usersPage <= 1} onClick={() => setUsersPage(p => p - 1)} className="muted" style={{ padding: '6px 12px' }}>PREV</button>
              <span style={{ fontSize: '12px', color: 'var(--text2)', alignSelf: 'center' }}>PAGE {usersPage} / {usersTotalPages}</span>
              <button disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage(p => p + 1)} className="muted" style={{ padding: '6px 12px' }}>NEXT</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
