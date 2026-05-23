import React from 'react';
import { Route } from 'react-router-dom';
import { PublicLayout } from '@/public-app/layouts/PublicLayout';
import { MenuPage } from '@/public-app/pages/Menu/MenuPage';
import { FeedbackPage } from '@/public-app/pages/Feedback/FeedbackPage';

export const renderPublicMenuRoutes = () => [
    /* ================= PUBLIC MENU ================= */
    /* With QR Code */
    <Route key="menu-qr" path="/menu/:restaurantSlug/:qrCode" element={<PublicLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
    </Route>,

    /* Without QR Code */
    <Route key="menu-no-qr" path="/menu/:restaurantSlug" element={<PublicLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
    </Route>
];
