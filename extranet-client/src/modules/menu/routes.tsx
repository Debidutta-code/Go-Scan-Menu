import { MenuManagement } from './pages/MenuManagement';
import { AddEditMenuItem } from './pages/AddEditMenuItem';
import { CategoryManagement } from './pages/CategoryManagement';
import { AddEditCategory } from './pages/AddEditCategory';
import { ModifierManagement } from './pages/ModifierManagement';

export const menuRoutes = [
    { path: '/staff/menu', element: <MenuManagement /> },
    { path: '/staff/menu/add', element: <AddEditMenuItem /> },
    { path: '/staff/menu/edit/:id', element: <AddEditMenuItem /> },
    { path: '/staff/categories', element: <CategoryManagement /> },
    { path: '/staff/categories/add', element: <AddEditCategory /> },
    { path: '/staff/categories/edit/:id', element: <AddEditCategory /> },
    { path: '/staff/modifiers', element: <ModifierManagement /> },
];
