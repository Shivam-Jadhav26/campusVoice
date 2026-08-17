import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('cv_access_token'));

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('cv_access_token');
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to restore session', error);
          logout();
        }
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const payload = response.data.data;
      setUser(payload.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const payload = response.data.data;
      
      localStorage.setItem('cv_access_token', payload.accessToken);
      localStorage.setItem('cv_refresh_token', payload.refreshToken);
      
      setAccessToken(payload.accessToken);
      setUser(payload.user);
      setIsAuthenticated(true);
      
      return payload.user.role;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (isAuthenticated) {
        await authAPI.logout().catch(() => {}); // Ignore logout errors
      }
    } finally {
      localStorage.removeItem('cv_access_token');
      localStorage.removeItem('cv_refresh_token');
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, accessToken, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
