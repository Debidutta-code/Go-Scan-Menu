import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { StaffLoginPage } from './pages/StaffLogin';
import { PublicAdminRoute, PublicStaffRoute } from './guards';

export const authRoutes = [
    {
        path: '/sadmin/login',
        element: (
            <PublicAdminRoute>
                <LoginPage />
            </PublicAdminRoute>
        ),
    },
    {
        path: '/register',
        element: (
            <PublicAdminRoute>
                <RegisterPage />
            </PublicAdminRoute>
        ),
    },
    {
        path: '/staff/login',
        element: (
            <PublicStaffRoute>
                <StaffLoginPage />
            </PublicStaffRoute>
        ),
    },
];
