import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
// Super Admin Protection
export const ProtectedAdminRoute = ({ children }) => {
    const { superAdmin, isLoading } = useAuth();
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return superAdmin ? children : _jsx(Navigate, { to: "/sadmin/login", replace: true });
};
// Staff Protection
export const ProtectedStaffRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useStaffAuth();
    if (isLoading)
        return _jsx("div", { children: "Loading staff portal..." });
    return isAuthenticated ? children : _jsx(Navigate, { to: "/staff/login", replace: true });
};
// Staff Public Protection (Redirect to dashboard if already logged in)
export const PublicStaffRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useStaffAuth();
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return isAuthenticated ? _jsx(Navigate, { to: "/staff/dashboard", replace: true }) : children;
};
// Root Redirect Logic
export const RootRedirect = () => {
    const { superAdmin, isLoading: isAdminLoading } = useAuth();
    const { isAuthenticated: isStaffAuthenticated, isLoading: isStaffLoading } = useStaffAuth();
    if (isAdminLoading || isStaffLoading)
        return _jsx("div", { children: "Loading..." });
    if (superAdmin)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    if (isStaffAuthenticated)
        return _jsx(Navigate, { to: "/staff/dashboard", replace: true });
    return _jsx(Navigate, { to: "/staff/login", replace: true });
};
// Admin Public Protection (Redirect to dashboard if already logged in)
export const PublicAdminRoute = ({ children }) => {
    const { superAdmin, isLoading } = useAuth();
    if (isLoading)
        return _jsx("div", { children: "Loading..." });
    return superAdmin ? _jsx(Navigate, { to: "/dashboard", replace: true }) : children;
};
