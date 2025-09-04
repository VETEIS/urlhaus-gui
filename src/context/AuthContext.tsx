import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  authKey: string | null;
  setAuthKey: (key: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authKey, setAuthKeyState] = useState<string | null>(() => {
    // Initialize with stored value immediately to prevent flash
    if (typeof window !== 'undefined') {
      return localStorage.getItem('urlhaus_auth_key');
    }
    return null;
  });

  const setAuthKey = useCallback((key: string | null) => {
    setAuthKeyState(key);
    if (key) {
      localStorage.setItem('urlhaus_auth_key', key);
    } else {
      localStorage.removeItem('urlhaus_auth_key');
    }
  }, []);

  // Secure logout function with comprehensive cleanup
  const logout = useCallback(() => {
    // Clear authentication state
    setAuthKeyState(null);
    
    // Remove all stored authentication data
    localStorage.removeItem('urlhaus_auth_key');
    
    // Clear any other potentially sensitive data
    try {
      // Clear session storage as well for additional security
      sessionStorage.clear();
      
      // Clear any cached API responses or tokens
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    } catch (error) {
      console.warn('Error during logout cleanup:', error);
    }
    
    // Force a page reload to ensure complete state reset
    // This prevents any potential memory leaks or cached state
    window.location.reload();
  }, []);

  const value = useMemo(() => ({ authKey, setAuthKey, logout }), [authKey, setAuthKey, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


