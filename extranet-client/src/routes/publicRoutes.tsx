import { Route } from 'react-router-dom';
import { PublicLayout } from '@/public-app/layouts/PublicLayout';
import { MenuPage } from '@/public-app/pages/Menu/MenuPage';

export const renderPublicMenuRoutes = () => [
    /* ================= PUBLIC MENU ================= */
    <Route key="menu-slug" path="/menu/:restaurantSlug" element={<PublicLayout />}>
        <Route index element={<MenuPage />} />
    </Route>
];
