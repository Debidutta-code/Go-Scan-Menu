import React from 'react';
import { Route } from 'react-router-dom';
import { PublicLayout } from '@/public-app/layouts/PublicLayout';
import { MenuWrapper } from '@/public-app/pages/Menu/MenuWrapper';
import { CategoryPage } from '@/public-app/pages/Menu/CategoryPage';
import { MenuListPage } from '@/public-app/pages/Menu/MenuListPage';
import { FeedbackPage } from '@/public-app/pages/Feedback/FeedbackPage';

export const renderPublicMenuRoutes = () => [
    /* ================= PUBLIC MENU ================= */
    /* With QR Code */
    <Route key="menu-qr" path="/menu/:restaurantSlug/:qrCode" element={<PublicLayout />}>
        <Route element={<MenuWrapper />}>
            <Route index element={<CategoryPage />} />
            <Route path="items" element={<MenuListPage />} />
        </Route>
        <Route path="feedback" element={<FeedbackPage />} />
    </Route>,

    /* Without QR Code */
    <Route key="menu-no-qr" path="/menu/:restaurantSlug" element={<PublicLayout />}>
        <Route element={<MenuWrapper />}>
            <Route index element={<CategoryPage />} />
            <Route path="items" element={<MenuListPage />} />
        </Route>
        <Route path="feedback" element={<FeedbackPage />} />
    </Route>
];
