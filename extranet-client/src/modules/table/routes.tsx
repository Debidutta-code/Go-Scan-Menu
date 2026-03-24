import { TableManagement } from './pages/TableManagement';
import { QRManagement } from './pages/QRManagement';

export const tableRoutes = [
    { path: '/staff/tables/:branchId', element: <TableManagement /> },
    { path: '/staff/tables/:branchId/qr-settings', element: <QRManagement /> },
];
