import { Orders } from './pages/Orders';

export const orderRoutes = [
    { path: '/staff/orders', element: <Orders /> },
    { path: '/staff/orders/:branchId', element: <Orders /> },
];
