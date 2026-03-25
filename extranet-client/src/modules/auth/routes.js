import { jsx as _jsx } from "react/jsx-runtime";
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { StaffLoginPage } from './pages/StaffLogin';
import { PublicAdminRoute, PublicStaffRoute } from './guards';
export const authRoutes = [
    {
        path: '/sadmin/login',
        element: (_jsx(PublicAdminRoute, { children: _jsx(LoginPage, {}) })),
    },
    {
        path: '/register',
        element: (_jsx(PublicAdminRoute, { children: _jsx(RegisterPage, {}) })),
    },
    {
        path: '/staff/login',
        element: (_jsx(PublicStaffRoute, { children: _jsx(StaffLoginPage, {}) })),
    },
];
