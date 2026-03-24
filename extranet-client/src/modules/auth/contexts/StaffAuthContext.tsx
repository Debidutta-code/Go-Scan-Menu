// src/contexts/StaffAuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffService } from '@/modules/staff/services/staff.service'; // Your staff service
import { Staff } from '@/shared/types/staff.types';

// ── Global auth-expiry event ──────────────────────────────────────────────────
// Any page/service can call triggerStaffAuthExpiry() to force a logout when
// it receives a 401 / "Authentication failed" response from the server.
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
  isAuthenticated: boolean;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Global auth-expiry listener ─────────────────────────────────────────────
  // Fires when any page or service detects a 401 / expired-token response.
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn('[StaffAuth] Token expired — logging out and redirecting to login.');
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_data');
      setToken(null);
      setStaff(null);
      navigate('/staff/login', { replace: true });
    };

    window.addEventListener(STAFF_AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(STAFF_AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [navigate]);

  // Load stored token and staff on mount
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
          console.error('Failed to parse stored staff data');
          localStorage.removeItem('staff_token');
          localStorage.removeItem('staff_data');
        }
      }
      setIsLoading(false);
    };

    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await StaffService.login(email, password);

      if (!response.success || !response.data?.staff || !response.data?.token) {
        throw new Error('Login failed');
      }

      const { staff, token } = response.data;

      // Store in localStorage
      localStorage.setItem('staff_token', token);
      localStorage.setItem('staff_data', JSON.stringify(staff));

      // Update state
      setToken(token);
      setStaff(staff);
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'Invalid credentials');
    }
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

  const value: StaffAuthContextType = {
    staff,
    token,
    login,
    logout,
    updateCurrentStaff,
    isAuthenticated: !!token && !!staff,
    isLoading,
  };

  return <StaffAuthContext.Provider value={value}>{children}</StaffAuthContext.Provider>;
};

// Custom hook
export const useStaffAuth = (): StaffAuthContextType => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};
