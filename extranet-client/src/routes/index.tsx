import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RootRedirect } from './guards';
import { renderAdminRoutes } from './adminRoutes';
import { renderStaffRoutes } from './staffRoutes';
import { renderPublicMenuRoutes } from './publicRoutes';
import NotFound from '../pages/NotFound/NotFound';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* ================= ROOT ================= */}
            <Route path="/" element={<RootRedirect />} />

            {/* ================= ADMIN ================= */}
            {renderAdminRoutes()}

            {/* ================= STAFF ================= */}
            {renderStaffRoutes()}

            {/* ================= PUBLIC ================= */}
            {renderPublicMenuRoutes()}

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
