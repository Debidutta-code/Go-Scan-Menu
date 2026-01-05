// src/components/common/PermissionGuard.tsx
import React from 'react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';

interface PermissionGuardProps {
  permission: keyof NonNullable<any>['permissions'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { staff } : any = useStaffAuth();

  if (!staff || !staff.permissions || !staff.permissions[permission]) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
