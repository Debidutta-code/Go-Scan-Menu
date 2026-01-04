// src/App.tsx (or App.jsx)

import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loading } from './components/common/Loading';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';
import { StaffLoginPage } from './pages/auth/StaffLogin';
import { RestaurantList } from './pages/restaurants/RestaurantList';
import { CreateRestaurant } from './pages/restaurants/CreateRestaurant';
import { ViewRestaurant } from './pages/restaurants/ViewRestaurant';
import { EditRestaurant } from './pages/restaurants/EditRestaurant';

function App() {
  const { superAdmin } = useAuth();

  return (
    <Routes>
      {/* Root redirect based on auth status */}
      <Route
        path="/"
        element={
          <Navigate
            to={superAdmin ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          superAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          superAdmin ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />

      {/* Staff Login Route */}
      <Route path="/staff/login" element={<StaffLoginPage />} />

      {/* Protected Routes - Super Admin Only */}
      <Route
        path="/dashboard"
        element={
          superAdmin ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Restaurant List - Protected Route */}
      <Route
        path="/restaurants"
        element={
          superAdmin ? <RestaurantList /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/restaurants/create"
        element={
          superAdmin ? <CreateRestaurant /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/restaurants/:id"
        element={
          superAdmin ? <ViewRestaurant /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/restaurants/:id/edit"
        element={
          superAdmin ? <EditRestaurant /> : <Navigate to="/login" replace />
        }
      />

      {/* 404 / Catch-all Route */}
      <Route
        path="*"
        element={
          <Navigate
            to={superAdmin ? '/dashboard' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;