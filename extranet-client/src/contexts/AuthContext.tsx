// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, SuperAdmin } from '../types';
import { ApiService } from '../services/api.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('superadmin_token');
    const storedAdmin = localStorage.getItem('superadmin_data');

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setSuperAdmin(JSON.parse(storedAdmin));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    if (response.data) {
      setToken(response.data.token);
      setSuperAdmin(response.data.superAdmin);
      localStorage.setItem('superadmin_token', response.data.token);
      localStorage.setItem('superadmin_data', JSON.stringify(response.data.superAdmin));
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await ApiService.register(name, email, password);
    if (response.data) {
      setToken(response.data.token);
      setSuperAdmin(response.data.superAdmin);
      localStorage.setItem('superadmin_token', response.data.token);
      localStorage.setItem('superadmin_data', JSON.stringify(response.data.superAdmin));
    }
  };

  const logout = () => {
    setSuperAdmin(null);
    setToken(null);
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_data');
  };

  return (
    <AuthContext.Provider value={{ superAdmin, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};