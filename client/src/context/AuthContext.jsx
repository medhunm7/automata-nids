import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nids_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nids_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/api/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('nids_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification error:', err.message);
          // If token failed, keep local user or logout
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('nids_token', res.data.token);
      localStorage.setItem('nids_user', JSON.stringify(res.data.user));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (name, email, password, role = 'analyst') => {
    const res = await api.post('/register', { name, email, password, role });
    if (res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('nids_token', res.data.token);
      localStorage.setItem('nids_user', JSON.stringify(res.data.user));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nids_token');
    localStorage.removeItem('nids_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
