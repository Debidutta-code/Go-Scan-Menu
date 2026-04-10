// src/components/common/PermissionGuard.tsx
import React from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffRole } from '../types/role.types';

interface PermissionGuardProps {
  permission?: string; // Dot notation: 'orders.view', 'menu.create'
  requiredRole?: StaffRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requiredRole,
  children,
  fallback = null,
}) => {
  const { staff } = useStaffAuth();

  if (!staff) return <>{fallback}</>;

  // SuperAdmin bypass
  if (staff.roleName === StaffRole.SUPER_ADMIN) {
    return <>{children}</>;
  }

  // Check Role requirement
  if (requiredRole && !requiredRole.includes(staff.roleName as StaffRole)) {
    return <>{fallback}</>;
  }

  // Check Permission requirement
  if (permission) {
    if (!staff.permissions) {
        return <>{fallback}</>;
    }
    const [module, action] = permission.split('.');
    const modulePermissions = (staff.permissions as any)[module];

    if (!modulePermissions || modulePermissions[action] !== true) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
