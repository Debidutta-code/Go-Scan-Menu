import React from 'react';
import { StaffAuthProvider } from '@/modules/auth/contexts/StaffAuthContext';
import { AppRouter } from './routes';

/* ===================== APP ===================== */

function App() {
  return (
    <StaffAuthProvider>
      <AppRouter />
    </StaffAuthProvider>
  );
}

export default App;
