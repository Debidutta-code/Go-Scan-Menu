import { RestaurantList } from './pages/RestaurantList';
import { CreateRestaurant } from './pages/CreateRestaurant';
import { ViewRestaurant } from './pages/ViewRestaurant';
import { EditRestaurant } from './pages/EditRestaurant';
import { SuperAdminQRManagement } from './pages/SuperAdminQRManagement';

export const restaurantRoutes = [
    { path: '/restaurants', element: <RestaurantList /> },
    { path: '/restaurants/create', element: <CreateRestaurant /> },
    { path: '/restaurants/:id', element: <ViewRestaurant /> },
    { path: '/restaurants/:id/edit', element: <EditRestaurant /> },
    { path: '/qr-management', element: <SuperAdminQRManagement /> },
];
