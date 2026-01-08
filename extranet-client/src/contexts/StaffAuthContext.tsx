// src/contexts/StaffAuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { StaffService } from '../services/staff.service'; // Your staff service
import { Staff } from '../types/staff.types';

interface StaffAuthContextType {
  staff: Staff | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(
  undefined
);

export const StaffAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const value: StaffAuthContextType = {
    staff,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!staff,
    isLoading,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};

// Custom hook
export const useStaffAuth = (): StaffAuthContextType => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};