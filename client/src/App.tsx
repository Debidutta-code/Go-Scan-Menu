import React from 'react';
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
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Customer */}
          <Route path="/menu/:restaurantSlug/:branchCode/:qrCode" element={<CustomerMenu />} />
          <Route path="/menu/:restaurantSlug/:branchCode" element={<CustomerMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-tracking/:orderNumber" element={<OrderTracking />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/tables" element={<TableManagement />} />
          <Route path="/admin/kitchen" element={<KitchenDisplay />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/branches" element={<BranchManagement />} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
