import { jsx as _jsx } from "react/jsx-runtime";
import { Orders } from './pages/Orders';
export const orderRoutes = [
    { path: '/staff/orders', element: _jsx(Orders, {}) },
    { path: '/staff/orders/:branchId', element: _jsx(Orders, {}) },
];
