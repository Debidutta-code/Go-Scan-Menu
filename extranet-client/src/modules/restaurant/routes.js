import { jsx as _jsx } from "react/jsx-runtime";
import { RestaurantList } from './pages/RestaurantList';
import { CreateRestaurant } from './pages/CreateRestaurant';
import { ViewRestaurant } from './pages/ViewRestaurant';
import { EditRestaurant } from './pages/EditRestaurant';
export const restaurantRoutes = [
    { path: '/restaurants', element: _jsx(RestaurantList, {}) },
    { path: '/restaurants/create', element: _jsx(CreateRestaurant, {}) },
    { path: '/restaurants/:id', element: _jsx(ViewRestaurant, {}) },
    { path: '/restaurants/:id/edit', element: _jsx(EditRestaurant, {}) },
];
