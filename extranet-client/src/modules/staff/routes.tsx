import { StaffList } from './pages/StaffList';
import { AddStaff } from './pages/AddStaff';
import { EditStaff } from './pages/EditStaff';
import { RolePermissions } from './pages/RolePermissions';

export const staffRoutes = [
    { path: '/staff/team', element: <StaffList /> },
    { path: '/staff/team/add', element: <AddStaff /> },
    { path: '/staff/team/edit/:id', element: <EditStaff /> },
    { path: '/staff/permissions', element: <RolePermissions /> },
];
