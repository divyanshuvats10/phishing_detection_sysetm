import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="pane" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="panel-bar">
          <span className="panel-title">// user_auth_login</span>
          <div className="window-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
        <div className="panel-body">
          <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>SYSTEM LOGIN</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="operative@phiscease.local"
              />
            </div>
            <div className="input-group">
              <label>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="********"
              />
            </div>
            <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '20px' }}>
              AUTHENTICATE
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: 'var(--text2)' }}>NO ACCOUNT?</span>{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>REGISTER INITIALIZE</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
