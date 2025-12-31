import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loading } from './components/common/Loading';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { LoginPage } from './pages/auth/Login';
import { RegisterPage } from './pages/auth/Register';

function App() {
  const { superAdmin } = useAuth();

  return (
    <Routes>
      {/* Root route */}
      <Route
        path="/"
        element={
          <Navigate
            to={superAdmin ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      {/* Public routes */}
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

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          superAdmin ? <Dashboard /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch-all */}
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
