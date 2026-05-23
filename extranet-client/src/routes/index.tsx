import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StaffLayout } from '@/shared/layouts/StaffLayout';
import { ProtectedStaffRoute } from '@/modules/auth/guards';

import { authRoutes } from '@/modules/auth/routes';
import { menuRoutes } from '@/modules/menu/routes';
import NotFound from '@/shared/components/NotFound/NotFound';
import { renderPublicMenuRoutes } from './publicRoutes';

export const AppRouter = () => {
    return (
        <Routes>
            {/* Auth Routes */}
            {authRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}

            {/* Staff Protected Routes */}
            <Route element={<ProtectedStaffRoute><StaffLayout /></ProtectedStaffRoute>}>
                {[
                    ...menuRoutes,
                ].map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            {/* Public Menu Routes */}
            {renderPublicMenuRoutes()}

            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/staff/menu" replace />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
