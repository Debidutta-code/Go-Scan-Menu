import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/StaffAuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StaffService } from '@/modules/staff/services/staff.service'; // Your staff service
// ── Global auth-expiry event ──────────────────────────────────────────────────
// Any page/service can call triggerStaffAuthExpiry() to force a logout when
// it receives a 401 / "Authentication failed" response from the server.
export const STAFF_AUTH_EXPIRED_EVENT = 'staff:auth-expired';
export const triggerStaffAuthExpiry = () => {
    window.dispatchEvent(new CustomEvent(STAFF_AUTH_EXPIRED_EVENT));
};
const StaffAuthContext = createContext(undefined);
export const StaffAuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [token, setToken] = useState(null);
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
                }
                catch (err) {
                    console.error('Failed to parse stored staff data');
                    localStorage.removeItem('staff_token');
                    localStorage.removeItem('staff_data');
                }
            }
            setIsLoading(false);
        };
        loadStoredAuth();
    }, []);
    const login = async (email, password) => {
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
        }
        catch (err) {
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
    const updateCurrentStaff = (updatedFields) => {
        if (!staff)
            return;
        const updatedStaff = { ...staff, ...updatedFields };
        setStaff(updatedStaff);
        localStorage.setItem('staff_data', JSON.stringify(updatedStaff));
    };
    const value = {
        staff,
        token,
        login,
        logout,
        updateCurrentStaff,
        isAuthenticated: !!token && !!staff,
        isLoading,
    };
    return _jsx(StaffAuthContext.Provider, { value: value, children: children });
};
// Custom hook
export const useStaffAuth = () => {
    const context = useContext(StaffAuthContext);
    if (context === undefined) {
        throw new Error('useStaffAuth must be used within a StaffAuthProvider');
    }
    return context;
};
