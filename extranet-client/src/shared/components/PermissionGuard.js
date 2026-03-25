import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
export const PermissionGuard = ({ permission, children, fallback = null, }) => {
    const { staff } = useStaffAuth();
    if (!staff || !staff.permissions) {
        return _jsx(_Fragment, { children: fallback });
    }
    // SuperAdmin bypass
    if (staff.role === 'super_admin') {
        return _jsx(_Fragment, { children: children });
    }
    const [module, action] = permission.split('.');
    if (action) {
        // Check specific action: staff.permissions.orders.view
        if (!staff.permissions[module] || !staff.permissions[module][action]) {
            return _jsx(_Fragment, { children: fallback });
        }
    }
    else {
        // Check if any action in module is true
        const modulePermissions = staff.permissions[module];
        if (!modulePermissions)
            return _jsx(_Fragment, { children: fallback });
        const hasAnyPermission = Object.values(modulePermissions).some(val => val === true);
        if (!hasAnyPermission) {
            return _jsx(_Fragment, { children: fallback });
        }
    }
    return _jsx(_Fragment, { children: children });
};
