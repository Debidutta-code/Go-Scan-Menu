import React from 'react';
import { Route, Outlet } from 'react-router-dom';
import { ProtectedAdminRoute, PublicAdminRoute } from './guards';
import { LoginPage } from '../pages/auth/Login';
import { RegisterPage } from '../pages/auth/Register';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { RestaurantList } from '../pages/restaurants/RestaurantList';
import { CreateRestaurant } from '../pages/restaurants/CreateRestaurant';
import { ViewRestaurant } from '../pages/restaurants/ViewRestaurant';
import { EditRestaurant } from '../pages/restaurants/EditRestaurant';

export const renderAdminRoutes = () => [
    /* ================= SUPER ADMIN AUTH ================= */
    <Route
        key="login"
        path="/sadmin/login"
        element={
            <PublicAdminRoute>
                <LoginPage />
            </PublicAdminRoute>
        }
    />,
    <Route
        key="register"
        path="/register"
        element={
            <PublicAdminRoute>
                <RegisterPage />
            </PublicAdminRoute>
        }
    />,

    /* ================= SUPER ADMIN ================= */
    <Route
        key="admin-protected"
        element={
            <ProtectedAdminRoute>
                <Outlet />
            </ProtectedAdminRoute>
        }
    >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurants/create" element={<CreateRestaurant />} />
        <Route path="/restaurants/:id" element={<ViewRestaurant />} />
        <Route path="/restaurants/:id/edit" element={<EditRestaurant />} />
    </Route>
];
