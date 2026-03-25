import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route } from 'react-router-dom';
import { PublicLayout } from '@/public-app/layouts/PublicLayout';
import { MenuPage } from '@/public-app/pages/Menu/MenuPage';
import { OrdersPage } from '@/public-app/pages/Orders/OrdersPage';
import { CartPage } from '@/public-app/pages/Cart/CartPage';
import { PaymentPage } from '@/public-app/pages/Payment/PaymentPage';
import { GamesPage } from '@/public-app/pages/Games/GamesPage';
import { renderGameRoutes } from './gameRoutes';
export const renderPublicMenuRoutes = () => [
    /* ================= PUBLIC MENU ================= */
    /* With QR Code */
    _jsxs(Route, { path: "/menu/:restaurantSlug/:branchCode/:qrCode", element: _jsx(PublicLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(MenuPage, {}) }), _jsx(Route, { path: "orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "cart", element: _jsx(CartPage, {}) }), _jsx(Route, { path: "payment", element: _jsx(PaymentPage, {}) }), _jsx(Route, { path: "games", element: _jsx(GamesPage, {}) }), renderGameRoutes()] }, "menu-qr"),
    /* Without QR Code */
    _jsxs(Route, { path: "/menu/:restaurantSlug/:branchCode", element: _jsx(PublicLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(MenuPage, {}) }), _jsx(Route, { path: "orders", element: _jsx(OrdersPage, {}) }), _jsx(Route, { path: "cart", element: _jsx(CartPage, {}) }), _jsx(Route, { path: "payment", element: _jsx(PaymentPage, {}) }), _jsx(Route, { path: "games", element: _jsx(GamesPage, {}) }), renderGameRoutes()] }, "menu-no-qr")
];
