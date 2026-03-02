import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { RootRedirect } from './guards';
import { AdminRoutes } from './adminRoutes';
import { StaffRoutes } from './staffRoutes';
import { PublicMenuRoutes } from './publicRoutes';
import NotFound from '../pages/NotFound/NotFound';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* ================= ROOT ================= */}
            <Route path="/" element={<RootRedirect />} />

            {/* ================= ADMIN ================= */}
            {AdminRoutes()}

            {/* ================= STAFF ================= */}
            {StaffRoutes()}

            {/* ================= PUBLIC ================= */}
            {PublicMenuRoutes()}

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
