import { jsx as _jsx } from "react/jsx-runtime";
import { TableManagement } from './pages/TableManagement';
import { QRManagement } from './pages/QRManagement';
export const tableRoutes = [
    { path: '/staff/tables/:branchId', element: _jsx(TableManagement, {}) },
    { path: '/staff/tables/:branchId/qr-settings', element: _jsx(QRManagement, {}) },
];
