import { jsx as _jsx } from "react/jsx-runtime";
import { MenuManagement } from './pages/MenuManagement';
import { AddEditMenuItem } from './pages/AddEditMenuItem';
import { CategoryManagement } from './pages/CategoryManagement';
import { AddEditCategory } from './pages/AddEditCategory';
export const menuRoutes = [
    { path: '/staff/menu', element: _jsx(MenuManagement, {}) },
    { path: '/staff/menu/add', element: _jsx(AddEditMenuItem, {}) },
    { path: '/staff/menu/edit/:id', element: _jsx(AddEditMenuItem, {}) },
    { path: '/staff/categories', element: _jsx(CategoryManagement, {}) },
    { path: '/staff/categories/add', element: _jsx(AddEditCategory, {}) },
    { path: '/staff/categories/edit/:id', element: _jsx(AddEditCategory, {}) },
];
