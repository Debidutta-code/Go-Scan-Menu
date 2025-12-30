import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { getUser, getToken } from '@/utils/storage.util';

export const useAuth = () => {
  const [user, setUser] = useState<any>(getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    setIsAuthenticated(!!token);
    if (token) {
      setUser(getUser());
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };
};
