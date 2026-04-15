// src/components/common/PermissionGuard.tsx
import React from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffRole, RoleLevel } from '../types/role.types';

interface PermissionGuardProps {
  permission?: string; // Dot notation: 'orders.view', 'menu.create'
  requiredRole?: StaffRole[];
  minLevel?: RoleLevel; // Numerically lower means higher rank (e.g., RoleLevel.MANAGER = 4)
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requiredRole,
  minLevel,
  children,
  fallback = null,
}) => {
  const { staff } = useStaffAuth();

  if (!staff) return <>{fallback}</>;

  // SuperAdmin bypass
  if (staff.roleName === StaffRole.SUPER_ADMIN) {
    return <>{children}</>;
  }

  const roleLevelMap: Record<string, number> = {
    [StaffRole.SUPER_ADMIN]: 1,
    [StaffRole.OWNER]: 2,
    [StaffRole.BRANCH_MANAGER]: 3,
    [StaffRole.MANAGER]: 4,
    [StaffRole.WAITER]: 5,
    [StaffRole.KITCHEN_STAFF]: 5,
    [StaffRole.CASHIER]: 5,
  };

  const userRole = (staff.roleName || (staff as any).staffType || '').toLowerCase();
  const userLevel = roleLevelMap[userRole] || 99;

  // Check Role requirement
  if (requiredRole) {
    // If specific roles are required, check if user has one of them or is higher rank
    const hasRequiredRole = requiredRole.includes(userRole as StaffRole);
    const minRequiredLevel = Math.min(...requiredRole.map(r => roleLevelMap[r] || 99));

    // User must either have the specific role OR be at a strictly higher rank (lower number)
    if (!hasRequiredRole && userLevel >= minRequiredLevel) {
        return <>{fallback}</>;
    }
  }

  // Check minLevel requirement (e.g., if minLevel is 3, user must be 1, 2, or 3)
  if (minLevel !== undefined) {
    if (userLevel > minLevel) {
      return <>{fallback}</>;
    }
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
