import { jsx as _jsx } from "react/jsx-runtime";
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '@/shared/services/api.service';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [superAdmin, setSuperAdmin] = useState(null);
    const [token, setToken] = useState(null);
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
    const login = async (email, password) => {
        const response = await ApiService.login(email, password);
        if (response.data) {
            setToken(response.data.token);
            setSuperAdmin(response.data.superAdmin);
            localStorage.setItem('superadmin_token', response.data.token);
            localStorage.setItem('superadmin_data', JSON.stringify(response.data.superAdmin));
        }
    };
    const register = async (name, email, password) => {
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
    return (_jsx(AuthContext.Provider, { value: { superAdmin, token, login, register, logout, isLoading }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within AuthProvider');
    return context;
};
