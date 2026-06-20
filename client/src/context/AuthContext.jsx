import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshPromiseRef = useRef(null);

  // Refresh token rotation (deduplicated to prevent concurrency token reuse warnings)
  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const runRefresh = async () => {
      try {
        const res = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.success) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          return data.accessToken;
        } else {
          setUser(null);
          setAccessToken(null);
          return null;
        }
      } catch (err) {
        console.error('Session refresh error:', err);
        setUser(null);
        setAccessToken(null);
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    };

    refreshPromiseRef.current = runRefresh();
    return refreshPromiseRef.current;
  }, []);

  // Initial check on load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      await refreshSession();
      setLoading(false);
    };
    initializeAuth();
  }, [refreshSession]);

  // Set up transparent token refresh intervals (every 14 minutes)
  useEffect(() => {
    if (!accessToken) return;
    
    const interval = setInterval(() => {
      console.log('[AuthContext] Triggering automatic token rotation check...');
      refreshSession();
    }, 14 * 60 * 1000); // 14 mins

    return () => clearInterval(interval);
  }, [accessToken, refreshSession]);

  // Login handler
  const login = async (email, password) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    setAccessToken(null);
    setUser(null);
  };

  // Authenticated API request wrapper (transparently handles JWT insertion)
  const authFetch = useCallback(async (url, options = {}) => {
    let token = accessToken;
    
    // Check if token is expired, or refresh it
    if (!token) {
      token = await refreshSession();
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const res = await fetch(url, { ...options, headers });
    
    // If we get a 401, token might have expired, try rotating once
    if (res.status === 401) {
      const renewedToken = await refreshSession();
      if (renewedToken) {
        headers['Authorization'] = `Bearer ${renewedToken}`;
        return await fetch(url, { ...options, headers });
      }
    }

    return res;
  }, [accessToken, refreshSession]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, authFetch, setUser }}>
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
