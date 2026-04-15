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
    'super_admin': 1,
    'owner': 2,
    'restaurant_owner': 2,
    'branch_manager': 3,
    'manager': 4,
    'store_manager': 4,
    'waiter': 5,
    'kitchen_staff': 5,
    'kitchen': 5,
    'cashier': 5,
  };

  const userRole = (
    staff.roleName ||
    (staff as any).staffType ||
    (staff.roleId && typeof staff.roleId === 'object' ? staff.roleId.name : '') ||
    ''
  ).toLowerCase();

  const userLevel = (staff as any).roleLevel ||
                    (staff.roleId && typeof staff.roleId === 'object' ? (staff.roleId as any).level : null) ||
                    roleLevelMap[userRole] ||
                    99;

  // Special bypass for SUPER_ADMIN or OWNER (if they have full perms)
  const isHighLevel = userLevel <= 2;

  // Check Role requirement
  if (requiredRole) {
    // If specific roles are required, check if user has one of them or is higher rank
    const hasRequiredRole = requiredRole.some(r => r.toLowerCase() === userRole);
    const minRequiredLevel = Math.min(...requiredRole.map(r => roleLevelMap[r.toLowerCase()] || 99));

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
    // High level bypass for permissions
    if (isHighLevel) return <>{children}</>;

    const permissions = staff.permissions ||
                        (staff.roleId && typeof staff.roleId === 'object' ? staff.roleId.permissions : null);

    if (!permissions) {
        console.warn(`[PermissionGuard] No permissions found for user ${staff.email}`);
        return <>{fallback}</>;
    }

    const [module, action] = permission.split('.');
    const modulePermissions = (permissions as any)[module];

    if (!modulePermissions || modulePermissions[action] !== true) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
