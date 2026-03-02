import React from 'react';
import { Route } from 'react-router-dom';
import { PublicLayout } from '../public-app/layouts/PublicLayout';
import { MenuPage } from '../public-app/pages/Menu/MenuPage';
import { OrdersPage } from '../public-app/pages/Orders/OrdersPage';
import { CartPage } from '../public-app/pages/Cart/CartPage';
import { PaymentPage } from '../public-app/pages/Payment/PaymentPage';
import { GamesPage } from '../public-app/pages/Games/GamesPage';
import { renderGameRoutes } from './gameRoutes';

export const renderPublicMenuRoutes = () => [
    /* ================= PUBLIC MENU ================= */
    /* With QR Code */
    <Route key="menu-qr" path="/menu/:restaurantSlug/:branchCode/:qrCode" element={<PublicLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="games" element={<GamesPage />} />
        {renderGameRoutes()}
    </Route>,

    /* Without QR Code */
    <Route key="menu-no-qr" path="/menu/:restaurantSlug/:branchCode" element={<PublicLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="games" element={<GamesPage />} />
        {renderGameRoutes()}
    </Route>
];
