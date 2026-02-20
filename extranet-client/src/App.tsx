import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuth } from './contexts/AuthContext';
import { StaffAuthProvider, useStaffAuth } from './contexts/StaffAuthContext';

/* ===================== SUPER ADMIN PAGES ===================== */
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';

import { RestaurantList } from './pages/restaurants/RestaurantList';
import { CreateRestaurant } from './pages/restaurants/CreateRestaurant';
import { ViewRestaurant } from './pages/restaurants/ViewRestaurant';
import { EditRestaurant } from './pages/restaurants/EditRestaurant';

/* ===================== STAFF PAGES ===================== */
import { StaffLoginPage } from './pages/auth/StaffLogin';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MenuManagement } from './pages/staff/menu-management/pages/';
import { CategoryManagement } from './pages/staff/category-management/CategoryManagement';
import { AddEditCategory } from './pages/staff/category-management/AddEditCategory';
import { AddEditMenuItem } from './pages/staff/AddEditMenuItem';
import { StaffList } from './pages/staff/StaffList';
import { AddStaff } from './pages/staff/AddStaff';
import { EditStaff } from './pages/staff/EditStaff';
import { RolePermissions } from './pages/staff/RolePermissions';
import { BranchSelection } from './pages/staff/BranchSelection';
import { TableManagement } from './pages/staff/TableManagement';
import { QRManagement } from './pages/staff/QRManagement';
import { StaffLayout } from './components/layout/StaffLayout';

/* ===================== PUBLIC ===================== */
import { PublicLayout } from './public-app/layouts/PublicLayout';
import { MenuPage } from './public-app/pages/Menu/MenuPage';
import { OrdersPage } from './public-app/pages/Orders/OrdersPage';
import { CartPage } from './public-app/pages/Cart/CartPage';
import { PaymentPage } from './public-app/pages/Payment/PaymentPage';
import { GamesPage } from './public-app/pages/Games/GamesPage';
import { GamesManagement as MemoryGame } from './public-app/games/memory-game/GamesManagement';
import { StackGame } from '@/public-app/games/stack-game/StackGame';
import { BrickGame } from '@/public-app/games/brick-game/BrickGame';
import { FingerPickGame } from './public-app/games/random-finger-pick/FingerPickGame';
import { FastestFingerGame } from './public-app/games/fastest-finger/FastestFingerGame';
import { RiseUpGame } from './public-app/games/rise-up/RiseUpGame';
import { ChidiyaUddGame } from './public-app/games/chidiya-udd/ChidiyaUddGame';

/* ===================== PROTECTED ROUTES ===================== */

// Super Admin Protection
const ProtectedAdminRoute = ({ children }: { children: React.JSX.Element }) => {
  const { superAdmin, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return superAdmin ? children : <Navigate to="/sadmin/login" replace />;
};

// Staff Protection
const ProtectedStaffRoute = ({ children }: { children: React.JSX.Element }) => {
  const { isAuthenticated, isLoading } = useStaffAuth();

  if (isLoading) return <div>Loading staff portal...</div>;

  return isAuthenticated ? children : <Navigate to="/staff/login" replace />;
};

/* ===================== APP ===================== */

function App() {
  const { superAdmin } = useAuth();

  return (
    <StaffAuthProvider>
      <Routes>
        {/* ================= ROOT ================= */}
        <Route
          path="/"
          element={<Navigate to={superAdmin ? '/dashboard' : '/staff/login'} replace />}
        />

        {/* ================= SUPER ADMIN AUTH ================= */}
        <Route
          path="/sadmin/login"
          element={superAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={superAdmin ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* ================= SUPER ADMIN ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/restaurants"
          element={
            <ProtectedAdminRoute>
              <RestaurantList />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/restaurants/create"
          element={
            <ProtectedAdminRoute>
              <CreateRestaurant />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/restaurants/:id"
          element={
            <ProtectedAdminRoute>
              <ViewRestaurant />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/restaurants/:id/edit"
          element={
            <ProtectedAdminRoute>
              <EditRestaurant />
            </ProtectedAdminRoute>
          }
        />

        {/* ================= STAFF AUTH ================= */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* ================= STAFF PORTAL ================= */}
        {/* ================= STAFF PORTAL ================= */}
        <Route element={<StaffLayout />}>
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedStaffRoute>
                <StaffDashboard />
              </ProtectedStaffRoute>
            }
          />

          {/* Menu */}
          <Route
            path="/staff/menu"
            element={
              <ProtectedStaffRoute>
                <MenuManagement />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/menu/add"
            element={
              <ProtectedStaffRoute>
                <AddEditMenuItem />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/menu/edit/:id"
            element={
              <ProtectedStaffRoute>
                <AddEditMenuItem />
              </ProtectedStaffRoute>
            }
          />

          {/* Categories */}
          <Route
            path="/staff/categories"
            element={
              <ProtectedStaffRoute>
                <CategoryManagement />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/categories/add"
            element={
              <ProtectedStaffRoute>
                <AddEditCategory />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/categories/edit/:id"
            element={
              <ProtectedStaffRoute>
                <AddEditCategory />
              </ProtectedStaffRoute>
            }
          />

          {/* Staff */}
          <Route
            path="/staff/team"
            element={
              <ProtectedStaffRoute>
                <StaffList />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/team/add"
            element={
              <ProtectedStaffRoute>
                <AddStaff />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/team/edit/:id"
            element={
              <ProtectedStaffRoute>
                <EditStaff />
              </ProtectedStaffRoute>
            }
          />

          {/* Permissions */}
          <Route
            path="/staff/permissions"
            element={
              <ProtectedStaffRoute>
                <RolePermissions />
              </ProtectedStaffRoute>
            }
          />

          {/* Tables */}
          <Route
            path="/staff/tables"
            element={
              <ProtectedStaffRoute>
                <BranchSelection />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/tables/:branchId"
            element={
              <ProtectedStaffRoute>
                <TableManagement />
              </ProtectedStaffRoute>
            }
          />
          <Route
            path="/staff/tables/:branchId/qr-settings"
            element={
              <ProtectedStaffRoute>
                <QRManagement />
              </ProtectedStaffRoute>
            }
          />
        </Route>

        {/* ================= PUBLIC MENU ================= */}
        {/* With QR Code */}
        <Route path="/menu/:restaurantSlug/:branchCode/:qrCode" element={<PublicLayout />}>
          <Route index element={<MenuPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="games/memory-game" element={<MemoryGame />} />
          <Route path="games/stack-game" element={<StackGame />} />
          <Route path="games/brick-game" element={<BrickGame />} />
          <Route path="games/finger-pick" element={<FingerPickGame />} />
          <Route path="games/fastest-finger" element={<FastestFingerGame />} />
          <Route path="games/rise-up" element={<RiseUpGame />} />
          <Route path="games/chidiya-udd" element={<ChidiyaUddGame />} />
        </Route>

        {/* Without QR Code */}
        <Route path="/menu/:restaurantSlug/:branchCode" element={<PublicLayout />}>
          <Route index element={<MenuPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="games/memory-game" element={<MemoryGame />} />
          <Route path="games/stack-game" element={<StackGame />} />
          <Route path="games/brick-game" element={<BrickGame />} />
          <Route path="games/finger-pick" element={<FingerPickGame />} />
          <Route path="games/fastest-finger" element={<FastestFingerGame />} />
          <Route path="games/rise-up" element={<RiseUpGame />} />
          <Route path="games/chidiya-udd" element={<ChidiyaUddGame />} />
        </Route>

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={<Navigate to={superAdmin ? '/dashboard' : '/staff/login'} replace />}
        />
      </Routes>
    </StaffAuthProvider>
  );
}

export default App;
