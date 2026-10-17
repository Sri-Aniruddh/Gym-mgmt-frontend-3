import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { getStoredAccessToken, setStoredAccessToken } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [firstLoginSession, setFirstLoginSession] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const storedToken = getStoredAccessToken();
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
        setToken(storedToken);
      } else {
        setUser(null);
        setToken(null);
        setStoredAccessToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
      setStoredAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data?.data;

    if (data?.mustChangePassword && data?.firstLoginToken) {
      setFirstLoginSession({
        required: true,
        token: data.firstLoginToken
      });
      return { mustChangePassword: true };
    }

    if (data?.accessToken && data?.user) {
      setStoredAccessToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setFirstLoginSession(null);
      return { mustChangePassword: false };
    }

    throw new Error('Unexpected response format from server');
  };

  const submitFirstTimePassword = async (newPassword) => {
    if (!firstLoginSession?.token) {
      throw new Error('No active first-login session found');
    }

    const res = await api.post(
      '/auth/first-time-password',
      { newPassword },
      { headers: { Authorization: `Bearer ${firstLoginSession.token}` } }
    );

    const data = res.data?.data;
    if (data?.accessToken && data?.user) {
      setStoredAccessToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      setFirstLoginSession(null);
    } else {
      throw new Error('Failed to set password');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors
    } finally {
      setStoredAccessToken(null);
      setToken(null);
      setUser(null);
      setFirstLoginSession(null);
      window.location.href = '/login';
    }
  };

  const updateCurrentUser = (userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        firstLoginSession,
        login,
        submitFirstTimePassword,
        logout,
        updateCurrentUser,
        checkAuth
      }}
    >
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

export default AuthContext;
