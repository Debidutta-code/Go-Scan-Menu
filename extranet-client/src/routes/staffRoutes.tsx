import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedStaffRoute, PublicStaffRoute } from './guards';
import { StaffLoginPage } from '../pages/auth/StaffLogin';
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { MenuManagement } from '../pages/staff/menu-management/pages/';
import { CategoryManagement } from '../pages/staff/category-management/CategoryManagement';
import { AddEditCategory } from '../pages/staff/category-management/AddEditCategory';
import { AddEditMenuItem } from '../pages/staff/AddEditMenuItem';
import { StaffList } from '../pages/staff/StaffList';
import { AddStaff } from '../pages/staff/AddStaff';
import { EditStaff } from '../pages/staff/EditStaff';
import { RolePermissions } from '../pages/staff/RolePermissions';
import { BranchSelection } from '../pages/staff/BranchSelection';
import { TableManagement } from '../pages/staff/TableManagement';
import { QRManagement } from '../pages/staff/QRManagement';
import { Orders } from '../pages/staff/order-management/Orders';
import { StaffLayout } from '../components/layout/StaffLayout';

export const renderStaffRoutes = () => [
    /* ================= STAFF AUTH ================= */
    <Route
        key="staff-login"
        path="/staff/login"
        element={
            <PublicStaffRoute>
                <StaffLoginPage />
            </PublicStaffRoute>
        }
    />,

    /* ================= STAFF PORTAL ================= */
    <Route
        key="staff-portal"
        element={
            <ProtectedStaffRoute>
                <StaffLayout />
            </ProtectedStaffRoute>
        }
    >
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Orders */}
        <Route path="/staff/orders" element={<Orders />} />
        <Route path="/staff/orders/:branchId" element={<Orders />} />

        {/* Menu */}
        <Route path="/staff/menu" element={<MenuManagement />} />
        <Route path="/staff/menu/add" element={<AddEditMenuItem />} />
        <Route path="/staff/menu/edit/:id" element={<AddEditMenuItem />} />

        {/* Categories */}
        <Route path="/staff/categories" element={<CategoryManagement />} />
        <Route path="/staff/categories/add" element={<AddEditCategory />} />
        <Route path="/staff/categories/edit/:id" element={<AddEditCategory />} />

        {/* Staff */}
        <Route path="/staff/team" element={<StaffList />} />
        <Route path="/staff/team/add" element={<AddStaff />} />
        <Route path="/staff/team/edit/:id" element={<EditStaff />} />

        {/* Permissions */}
        <Route path="/staff/permissions" element={<RolePermissions />} />

        {/* Tables */}
        <Route path="/staff/tables" element={<BranchSelection />} />
        <Route path="/staff/tables/:branchId" element={<TableManagement />} />
        <Route path="/staff/tables/:branchId/qr-settings" element={<QRManagement />} />
    </Route>
];
