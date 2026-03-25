import { jsx as _jsx } from "react/jsx-runtime";
import { Dashboard } from './pages/Dashboard';
import { StaffDashboard } from './pages/StaffDashboard';
export const dashboardRoutes = [
    { path: '/dashboard', element: _jsx(Dashboard, {}) },
    { path: '/staff/dashboard', element: _jsx(StaffDashboard, {}) },
];
