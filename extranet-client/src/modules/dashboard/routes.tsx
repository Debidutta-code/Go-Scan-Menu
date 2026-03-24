import { Dashboard } from './pages/Dashboard';
import { StaffDashboard } from './pages/StaffDashboard';

export const dashboardRoutes = [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/staff/dashboard', element: <StaffDashboard /> },
];
