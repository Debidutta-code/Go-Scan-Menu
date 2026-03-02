import React from 'react';
import { StaffAuthProvider } from './contexts/StaffAuthContext';
import { AppRoutes } from './routes';

/* ===================== APP ===================== */

function App() {
  return (
    <StaffAuthProvider>
      <AppRoutes />
    </StaffAuthProvider>
  );
}

export default App;
