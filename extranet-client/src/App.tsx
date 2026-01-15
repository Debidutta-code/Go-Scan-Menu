// src/App.tsx

// src/App.tsx

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { StaffAuthProvider, useStaffAuth } from './contexts/StaffAuthContext';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { StaffLoginPage } from './pages/auth/StaffLogin';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MenuManagement } from './pages/staff/MenuManagement';
import { CategoryManagement } from './pages/staff/CategoryManagement';
import { AddEditCategory } from './pages/staff/AddEditCategory';
import { AddEditMenuItem } from './pages/staff/AddEditMenuItem';
import { StaffList } from './pages/staff/StaffList';
import { AddStaff } from './pages/staff/AddStaff';
import { EditStaff } from './pages/staff/EditStaff';
import { RolePermissions } from './pages/staff/RolePermissions';
import { BranchSelection } from './pages/staff/BranchSelection';
import { TableManagement } from './pages/staff/TableManagement';
import { PublicMenu } from './pages/public/PublicMenu';

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

              {/* Menu Management Routes */}
              <Route
                path="menu"
                element={
                  <ProtectedStaffRoute>
                    <MenuManagement />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="menu/add"
                element={
                  <ProtectedStaffRoute>
                    <AddEditMenuItem />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="menu/edit/:id"
                element={
                  <ProtectedStaffRoute>
                    <AddEditMenuItem />
                  </ProtectedStaffRoute>
                }
              />

              {/* Category Management Routes */}
              <Route
                path="categories"
                element={
                  <ProtectedStaffRoute>
                    <CategoryManagement />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="categories/add"
                element={
                  <ProtectedStaffRoute>
                    <AddEditCategory />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="categories/edit/:id"
                element={
                  <ProtectedStaffRoute>
                    <AddEditCategory />
                  </ProtectedStaffRoute>
                }
              />

              {/* Staff Management Routes */}
              <Route
                path="team"
                element={
                  <ProtectedStaffRoute>
                    <StaffList />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="team/add"
                element={
                  <ProtectedStaffRoute>
                    <AddStaff />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="team/edit/:id"
                element={
                  <ProtectedStaffRoute>
                    <EditStaff />
                  </ProtectedStaffRoute>
                }
              />

              {/* Role Permissions Route */}
              <Route
                path="permissions"
                element={
                  <ProtectedStaffRoute>
                    <RolePermissions />
                  </ProtectedStaffRoute>
                }
              />

              {/* Table Management Routes */}
              <Route
                path="tables"
                element={
                  <ProtectedStaffRoute>
                    <BranchSelection />
                  </ProtectedStaffRoute>
                }
              />
              <Route
                path="tables/:branchId"
                element={
                  <ProtectedStaffRoute>
                    <TableManagement />
                  </ProtectedStaffRoute>
                }
              />

              {/* Default staff route - redirect to dashboard when accessing /staff directly */}
              <Route index element={<Navigate to="dashboard" replace />} />

              {/* 404 inside staff portal */}
              <Route path="*" element={<div>Staff Page Not Found</div>} />
            </Routes>
          </StaffAuthProvider>
        }
      />

      {/* ========== PUBLIC MENU ROUTES (No Authentication) ========== */}
      <Route path="/menu/:restaurantSlug/:branchCode/:qrCode" element={<PublicMenu />} />
      <Route path="/menu/:restaurantSlug/:branchCode" element={<PublicMenu />} />

      {/* Global 404 */}
      <Route
        path="*"
        element={<Navigate to={superAdmin ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;