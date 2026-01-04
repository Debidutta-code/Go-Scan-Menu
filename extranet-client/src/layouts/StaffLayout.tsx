// src/layouts/StaffLayout.tsx
import { Outlet } from 'react-router-dom';
import { StaffAuthProvider } from '../contexts/StaffAuthContext';

export const StaffLayout = () => {
  return (
    <StaffAuthProvider>
      <Outlet />
    </StaffAuthProvider>
  );
};