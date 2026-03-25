// extranet-client/src/shared/components/PermissionGuard.tsx
import React from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';

interface PermissionGuardProps {
  /**
   * Permission key in format 'module.action' (e.g., 'orders.view')
   * or just 'module' to check if any action in that module is allowed
   */
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const { staff }: any = useStaffAuth();

  if (!staff || !staff.permissions) {
    return <>{fallback}</>;
  }

  // SuperAdmin bypass
  if (staff.role === 'super_admin') {
    return <>{children}</>;
  }

  const [module, action] = permission.split('.');

  if (action) {
    // Check specific action: staff.permissions.orders.view
    if (!staff.permissions[module] || !staff.permissions[module][action]) {
      return <>{fallback}</>;
    }
  } else {
    // Check if any action in module is true
    const modulePermissions = staff.permissions[module];
    if (!modulePermissions) return <>{fallback}</>;

    const hasAnyPermission = Object.values(modulePermissions).some(val => val === true);
    if (!hasAnyPermission) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
