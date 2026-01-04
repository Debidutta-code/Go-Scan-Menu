// src/App.tsx

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { StaffAuthProvider } from './contexts/StaffAuthContext'; // ← ADD THIS IMPORT
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { StaffLoginPage } from './pages/auth/StaffLogin';
import { StaffDashboard } from './pages/staff/StaffDashboard'; // ← Create this page if not exists

import { RestaurantList } from './pages/restaurants/RestaurantList';
import { CreateRestaurant } from './pages/restaurants/CreateRestaurant';
import { ViewRestaurant } from './pages/restaurants/ViewRestaurant';
import { EditRestaurant } from './pages/restaurants/EditRestaurant';

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }: { children: any }) => {
  const { superAdmin, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  return superAdmin ? children : <Navigate to="/login" replace />;
};

// Protected Staff Route Component
const ProtectedStaffRoute = ({ children }: { children: any }) => {
  const { useStaffAuth } = require('./contexts/StaffAuthContext');
  const { isAuthenticated, isLoading } = useStaffAuth();

  if (isLoading) return <div>Loading staff portal...</div>;
  return isAuthenticated ? children : <Navigate to="/staff/login" replace />;
};

function App() {
  const { superAdmin } = useAuth();

  return (
    <Routes>
      {/* Root Redirect */}
      <Route
        path="/"
        element={<Navigate to={superAdmin ? '/dashboard' : '/login'} replace />}
      />

      {/* Super Admin Routes */}
      <Route
        path="/login"
        element={superAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={superAdmin ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      <Route
        path="/dashboard"
        element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>}
      />
      <Route
        path="/restaurants"
        element={<ProtectedAdminRoute><RestaurantList /></ProtectedAdminRoute>}
      />
      <Route
        path="/restaurants/create"
        element={<ProtectedAdminRoute><CreateRestaurant /></ProtectedAdminRoute>}
      />
      <Route
        path="/restaurants/:id"
        element={<ProtectedAdminRoute><ViewRestaurant /></ProtectedAdminRoute>}
      />
      <Route
        path="/restaurants/:id/edit"
        element={<ProtectedAdminRoute><EditRestaurant /></ProtectedAdminRoute>}
      />

      {/* ========== STAFF PORTAL ROUTES ========== */}
      {/* Wrap ALL staff routes (including login) with StaffAuthProvider */}
      <Route
        path="/staff/*"
        element={
          <StaffAuthProvider>
            <Routes>
              {/* Public: Staff Login */}
              <Route path="login" element={<StaffLoginPage />} />

              {/* Protected Staff Pages */}
              <Route
                path="dashboard"
                element={
                  <ProtectedStaffRoute>
                    <StaffDashboard />
                  </ProtectedStaffRoute>
                }
              />

              {/* Add more staff routes here later */}
              {/* <Route path="orders" element={<ProtectedStaffRoute><Orders /></ProtectedStaffRoute>} /> */}

              {/* Default staff route */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* 404 inside staff portal */}
              <Route path="*" element={<div>Staff Page Not Found</div>} />
            </Routes>
          </StaffAuthProvider>
        }
      />

      {/* Global 404 */}
      <Route
        path="*"
        element={<Navigate to={superAdmin ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;