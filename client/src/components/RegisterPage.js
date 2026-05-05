import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="layout">
      <div className="pane" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="panel-bar">
          <span className="panel-title">// user_auth_register</span>
          <div className="window-dots" aria-hidden>
            <span /><span /><span />
          </div>
        </div>
        <div className="panel-body">
          <h2 style={{ color: 'var(--accent)', marginTop: 0 }}>NEW OPERATIVE</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label>ALIAS (NAME)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                placeholder="Neo"
              />
            </div>
            <div className="input-group">
              <label>EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="neo@matrix.local"
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
              <small style={{ color: 'var(--text2)', display: 'block', marginTop: '5px' }}>Min length: 8 characters</small>
            </div>
            <button type="submit" className="action-btn" style={{ width: '100%', marginTop: '20px' }}>
              INITIALIZE PROFILE
            </button>
          </form>
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            <span style={{ color: 'var(--text2)' }}>ALREADY REGISTERED?</span>{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>ACCESS PORTAL</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
