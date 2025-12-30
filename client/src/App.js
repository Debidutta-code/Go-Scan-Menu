import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { SocketProvider } from './context/SocketContext';
// Customer Pages
import CustomerMenu from './pages/customer/CustomerMenu';
import Cart from './pages/customer/Cart';
import OrderTracking from './pages/customer/OrderTracking';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import TableManagement from './pages/admin/TableManagement';
import KitchenDisplay from './pages/admin/KitchenDisplay';
import StaffManagement from './pages/admin/StaffManagement';
import BranchManagement from './pages/admin/BranchManagement';
// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
function App() {
    return (_jsx(SocketProvider, { children: _jsxs(BrowserRouter, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/menu/:restaurantSlug/:branchCode/:qrCode", element: _jsx(CustomerMenu, {}) }), _jsx(Route, { path: "/menu/:restaurantSlug/:branchCode", element: _jsx(CustomerMenu, {}) }), _jsx(Route, { path: "/cart", element: _jsx(Cart, {}) }), _jsx(Route, { path: "/order-tracking/:orderNumber", element: _jsx(OrderTracking, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/admin/menu", element: _jsx(MenuManagement, {}) }), _jsx(Route, { path: "/admin/orders", element: _jsx(OrderManagement, {}) }), _jsx(Route, { path: "/admin/tables", element: _jsx(TableManagement, {}) }), _jsx(Route, { path: "/admin/kitchen", element: _jsx(KitchenDisplay, {}) }), _jsx(Route, { path: "/admin/staff", element: _jsx(StaffManagement, {}) }), _jsx(Route, { path: "/admin/branches", element: _jsx(BranchManagement, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login", replace: true }) })] }), _jsx(ToastContainer, { position: "top-right", autoClose: 3000 })] }) }));
}
export default App;
