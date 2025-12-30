import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from './pages/customer/CustomerMenu';
import Cart from './pages/customer/Cart';
import OrderTracking from './pages/customer/OrderTracking';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import TableManagement from './pages/admin/TableManagement';
import KitchenDisplay from './pages/admin/KitchenDisplay';
import Login from './pages/auth/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Customer */}
        <Route path="/menu/:restaurantSlug/:branchCode/:qrCode" element={<CustomerMenu />} />
        <Route path="/menu/:restaurantSlug/:branchCode" element={<CustomerMenu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/orders" element={<OrderManagement />} />
        <Route path="/admin/tables" element={<TableManagement />} />
        <Route path="/admin/kitchen" element={<KitchenDisplay />} />

        {/* Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
