import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';

// Super Admin Protection
export const ProtectedAdminRoute = ({ children }: { children: React.JSX.Element }) => {
    const { superAdmin, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    return superAdmin ? children : <Navigate to="/sadmin/login" replace />;
};

// Staff Protection
export const ProtectedStaffRoute = ({ children }: { children: React.JSX.Element }) => {
    const { isAuthenticated, isLoading } = useStaffAuth();

    if (isLoading) return <div>Loading staff portal...</div>;

    return isAuthenticated ? children : <Navigate to="/staff/login" replace />;
};

// Staff Public Protection (Redirect to dashboard if already logged in)
export const PublicStaffRoute = ({ children }: { children: React.JSX.Element }) => {
    const { isAuthenticated, isLoading } = useStaffAuth();

    if (isLoading) return <div>Loading...</div>;

    return isAuthenticated ? <Navigate to="/staff/dashboard" replace /> : children;
};

// Root Redirect Logic
export const RootRedirect = () => {
    const { superAdmin, isLoading: isAdminLoading } = useAuth();
    const { isAuthenticated: isStaffAuthenticated, isLoading: isStaffLoading } = useStaffAuth();

    if (isAdminLoading || isStaffLoading) return <div>Loading...</div>;

    if (superAdmin) return <Navigate to="/dashboard" replace />;
    if (isStaffAuthenticated) return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/staff/login" replace />;
};

// Admin Public Protection (Redirect to dashboard if already logged in)
export const PublicAdminRoute = ({ children }: { children: React.JSX.Element }) => {
    const { superAdmin, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    return superAdmin ? <Navigate to="/dashboard" replace /> : children;
};
