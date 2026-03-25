import { jsx as _jsx } from "react/jsx-runtime";
import { StaffList } from './pages/StaffList';
import { AddStaff } from './pages/AddStaff';
import { EditStaff } from './pages/EditStaff';
import { RolePermissions } from './pages/RolePermissions';
export const staffRoutes = [
    { path: '/staff/team', element: _jsx(StaffList, {}) },
    { path: '/staff/team/add', element: _jsx(AddStaff, {}) },
    { path: '/staff/team/edit/:id', element: _jsx(EditStaff, {}) },
    { path: '/staff/permissions', element: _jsx(RolePermissions, {}) },
];
