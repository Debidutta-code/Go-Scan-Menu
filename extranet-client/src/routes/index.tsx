import React from 'react';
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

export const AppRouter = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            {authRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {/* Admin Protected Routes */}
            <Route element={<ProtectedAdminRoute><Outlet /></ProtectedAdminRoute>}>
                {[...dashboardRoutes.filter(r => r.path === '/dashboard'), ...restaurantRoutes].map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            {/* Staff Protected Routes */}
            <Route element={<ProtectedStaffRoute><StaffLayout /></ProtectedStaffRoute>}>
                {[
                    ...dashboardRoutes.filter(r => r.path !== '/dashboard'),
                    ...branchRoutes,
                    ...staffRoutes,
                    ...menuRoutes,
                    ...tableRoutes,
                    ...orderRoutes,
                    ...settingsRoutes,
                ].map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
