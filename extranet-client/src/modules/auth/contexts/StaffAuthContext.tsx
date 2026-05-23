import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Staff } from '@/shared/types/staff.types';

export const STAFF_AUTH_EXPIRED_EVENT = 'staff:auth-expired';

export const triggerStaffAuthExpiry = () => {
  window.dispatchEvent(new CustomEvent(STAFF_AUTH_EXPIRED_EVENT));
};

interface StaffAuthContextType {
  staff: Staff | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentStaff: (updatedStaff: Partial<Staff>) => void;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_data');
      setToken(null);
      setStaff(null);
      navigate('/staff/login', { replace: true });
    };

    window.addEventListener(STAFF_AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(STAFF_AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [navigate]);

  useEffect(() => {
    const loadStoredAuth = () => {
      const storedToken = localStorage.getItem('staff_token');
      const storedStaff = localStorage.getItem('staff_data');

      if (storedToken && storedStaff) {
        try {
          const parsedStaff = JSON.parse(storedStaff);
          setToken(storedToken);
          setStaff(parsedStaff);
        } catch (err) {
          localStorage.removeItem('staff_token');
          localStorage.removeItem('staff_data');
        }
      }
      setIsLoading(false);
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    throw new Error('Login not implemented');
  };

  const logout = () => {
    localStorage.removeItem('staff_token');
    localStorage.removeItem('staff_data');
    setToken(null);
    setStaff(null);
  };

  const updateCurrentStaff = (updatedFields: Partial<Staff>) => {
    if (!staff) return;
    const updatedStaff = { ...staff, ...updatedFields };
    setStaff(updatedStaff);
    localStorage.setItem('staff_data', JSON.stringify(updatedStaff));
  };

  const refreshAuth = async () => {};

  const value: StaffAuthContextType = {
    staff,
    token,
    login,
    logout,
    updateCurrentStaff,
    refreshAuth,
    isAuthenticated: !!token && !!staff,
    isLoading,
  };

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
};

export const useStaffAuth = (): StaffAuthContextType => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
