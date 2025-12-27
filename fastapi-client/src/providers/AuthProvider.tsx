'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../../services/auth';

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // Read token on client after mount to avoid hydration mismatch between server and client
  useEffect(() => {
    try {
      const t = localStorage.getItem('admin_token');
      if (t) {
        // schedule update to avoid synchronous setState within effect
        setTimeout(() => setToken(t), 0);
      }
    } catch {
      // ignore
    }
  }, []);


  const login = async (username: string, password: string) => {
    const t = await authService.loginAdmin(username, password);
    if (!t) throw new Error('No token returned');
    setToken(t);
    localStorage.setItem('admin_token', t);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
    // optional: trigger a full reload
    // window.location.reload();
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
