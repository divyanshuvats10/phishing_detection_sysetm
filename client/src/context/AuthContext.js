import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Generate or retrieve guest session ID
  const [guestSessionId, setGuestSessionId] = useState(() => {
    let sid = localStorage.getItem('guestSessionId');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestSessionId', sid);
    }
    return sid;
  });

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setUser(data.user);
        } else {
          logout();
        }
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, guestSessionId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
