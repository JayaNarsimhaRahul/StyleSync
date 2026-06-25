import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Store token in both state and global variable (for axios interceptor)
  const storeToken = useCallback((token) => {
    window.__accessToken__ = token;
    setAccessToken(token);
  }, []);

  /**
   * Restore session on page load by calling /auth/refresh.
   * The httpOnly refresh token cookie is sent automatically.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        storeToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No valid refresh token → user is not logged in, that's fine
        storeToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [storeToken]);

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    storeToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    storeToken(data.accessToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Best-effort logout
    } finally {
      storeToken(null);
      setUser(null);
    }
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    isCustomer: user?.role === 'customer',
    isSuperAdmin: user?.role === 'superadmin',
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
