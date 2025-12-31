import { useState } from 'react'
import './App.css'
import { useAuth } from './contexts/AuthContext';
import { Loading } from './components/common/Loading';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { RegisterPage } from './pages/auth/Register';
import { LoginPage } from './pages/auth/Login';

function App() {
  const { superAdmin, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (superAdmin) {
    return <Dashboard />;
  }

  if (showRegister) {
    return <RegisterPage onBackToLogin={() => setShowRegister(false)} />;
  }

  return <LoginPage onShowRegister={() => setShowRegister(true)} />;

}

export default App
