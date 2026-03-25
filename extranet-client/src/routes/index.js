import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { StaffLayout } from '@/shared/layouts/StaffLayout';
import { ProtectedAdminRoute, ProtectedStaffRoute } from '@/modules/auth/guards';
import { authRoutes } from '@/modules/auth/routes';
import { restaurantRoutes } from '@/modules/restaurant/routes';
import { branchRoutes } from '@/modules/branch/routes';
import { staffRoutes } from '@/modules/staff/routes';
import { menuRoutes } from '@/modules/menu/routes';
import { tableRoutes } from '@/modules/table/routes';
import { orderRoutes } from '@/modules/order/routes';
import { dashboardRoutes } from '@/modules/dashboard/routes';
import { settingsRoutes } from '@/modules/settings/routes';
import NotFound from '@/shared/components/NotFound/NotFound';
import { renderPublicMenuRoutes } from './publicRoutes';
export const AppRouter = () => {
    return (_jsxs(Routes, { children: [authRoutes.map((route) => (_jsx(Route, { path: route.path, element: route.element }, route.path))), _jsx(Route, { element: _jsx(ProtectedAdminRoute, { children: _jsx(Outlet, {}) }), children: [...dashboardRoutes.filter(r => r.path === '/dashboard'), ...restaurantRoutes].map((route) => (_jsx(Route, { path: route.path, element: route.element }, route.path))) }), _jsx(Route, { element: _jsx(ProtectedStaffRoute, { children: _jsx(StaffLayout, {}) }), children: [
                    ...dashboardRoutes.filter(r => r.path !== '/dashboard'),
                    ...branchRoutes,
                    ...staffRoutes,
                    ...menuRoutes,
                    ...tableRoutes,
                    ...orderRoutes,
                    ...settingsRoutes,
                ].map((route) => (_jsx(Route, { path: route.path, element: route.element }, route.path))) }), renderPublicMenuRoutes(), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
};
