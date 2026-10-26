import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUserFromStorage());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem('spendly_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error('Session verification failed:', err);
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const userData = {
      id: res.id,
      fullName: res.fullName,
      email: res.email,
      currency: res.currency,
    };
    setUser(userData);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const userData = {
      id: res.id,
      fullName: res.fullName,
      email: res.email,
      currency: res.currency,
    };
    setUser(userData);
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem('spendly_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
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
