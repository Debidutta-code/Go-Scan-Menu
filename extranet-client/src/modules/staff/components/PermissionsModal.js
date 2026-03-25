import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/staff/components/PermissionsModal.tsx
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { StaffRole } from '@/shared/types/staffPermissions.types';
import { Button } from '@/shared/components/Button';
import './PermissionsModal.css';
const STAFF_ROLE_LABELS = {
    [StaffRole.SUPER_ADMIN]: 'Super Admin',
    [StaffRole.OWNER]: 'Owner',
    [StaffRole.BRANCH_MANAGER]: 'Branch Manager',
    [StaffRole.MANAGER]: 'Manager',
    [StaffRole.WAITER]: 'Waiter',
    [StaffRole.KITCHEN_STAFF]: 'Kitchen Staff',
    [StaffRole.CASHIER]: 'Cashier',
};
export const PermissionsModal = ({ isOpen, onClose, restaurantId, staffRole, token, onSave, }) => {
    const [role, setRole] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (isOpen && restaurantId && staffRole) {
            fetchRole();
        }
    }, [isOpen, restaurantId, staffRole]);
    const fetchRole = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch the role for this restaurant and role name
            const response = await fetch(`/api/v1/roles?restaurantId=${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const foundRole = data.data.find((r) => r.name === staffRole);
                if (foundRole) {
                    setRole(foundRole);
                    setPermissions(foundRole.permissions);
                }
                else {
                    setError('Role not found');
                }
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load permissions');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        if (!permissions || !role)
            return;
        try {
            setSaving(true);
            setError(null);
            await StaffPermissionsService.updateRolePermissions(token, role._id, {
                permissions,
            });
            onSave?.();
            onClose();
        }
        catch (err) {
            setError(err.message || 'Failed to save permissions');
        }
        finally {
            setSaving(false);
        }
    };
    const updatePermission = (category, field, value) => {
        if (!permissions)
            return;
        setPermissions({
            ...permissions,
            [category]: {
                ...permissions[category],
                [field]: value,
            },
        });
    };
    const toggleAllInCategory = (category, value) => {
        if (!permissions)
            return;
        const categoryPerms = permissions[category];
        const updatedCategory = Object.keys(categoryPerms).reduce((acc, key) => {
            acc[key] = value;
            return acc;
        }, {});
        setPermissions({
            ...permissions,
            [category]: updatedCategory,
        });
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-content permissions-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "modal-title", children: "Manage Permissions" }), _jsxs("p", { className: "modal-subtitle", children: [STAFF_ROLE_LABELS[staffRole], " Role Permissions"] })] }), _jsx("button", { className: "modal-close", onClick: onClose, children: _jsx(X, { size: 24 }) })] }), _jsx("div", { className: "modal-body", children: loading ? (_jsx("div", { className: "loading-state", children: "Loading permissions..." })) : error ? (_jsx("div", { className: "error-message", children: error })) : permissions ? (_jsxs("div", { className: "permissions-grid", children: [_jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Order Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('orders', !Object.values(permissions.orders).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.view, onChange: (e) => updatePermission('orders', 'view', e.target.checked) }), _jsx("span", { children: "View Orders" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.create, onChange: (e) => updatePermission('orders', 'create', e.target.checked) }), _jsx("span", { children: "Create Orders" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.update, onChange: (e) => updatePermission('orders', 'update', e.target.checked) }), _jsx("span", { children: "Update Orders" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.delete, onChange: (e) => updatePermission('orders', 'delete', e.target.checked) }), _jsx("span", { children: "Delete Orders" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.managePayment, onChange: (e) => updatePermission('orders', 'managePayment', e.target.checked) }), _jsx("span", { children: "Manage Payments" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.orders.viewAllBranches, onChange: (e) => updatePermission('orders', 'viewAllBranches', e.target.checked) }), _jsx("span", { children: "View All Branches" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Menu Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('menu', !Object.values(permissions.menu).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.view, onChange: (e) => updatePermission('menu', 'view', e.target.checked) }), _jsx("span", { children: "View Menu" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.create, onChange: (e) => updatePermission('menu', 'create', e.target.checked) }), _jsx("span", { children: "Create Menu Items" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.update, onChange: (e) => updatePermission('menu', 'update', e.target.checked) }), _jsx("span", { children: "Update Menu Items" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.delete, onChange: (e) => updatePermission('menu', 'delete', e.target.checked) }), _jsx("span", { children: "Delete Menu Items" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.manageCategories, onChange: (e) => updatePermission('menu', 'manageCategories', e.target.checked) }), _jsx("span", { children: "Manage Categories" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.menu.managePricing, onChange: (e) => updatePermission('menu', 'managePricing', e.target.checked) }), _jsx("span", { children: "Manage Pricing" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Staff Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('staff', !Object.values(permissions.staff).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.staff.view, onChange: (e) => updatePermission('staff', 'view', e.target.checked) }), _jsx("span", { children: "View Staff" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.staff.create, onChange: (e) => updatePermission('staff', 'create', e.target.checked) }), _jsx("span", { children: "Create Staff" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.staff.update, onChange: (e) => updatePermission('staff', 'update', e.target.checked) }), _jsx("span", { children: "Update Staff" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.staff.delete, onChange: (e) => updatePermission('staff', 'delete', e.target.checked) }), _jsx("span", { children: "Delete Staff" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.staff.manageRoles, onChange: (e) => updatePermission('staff', 'manageRoles', e.target.checked) }), _jsx("span", { children: "Manage Roles" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Reports & Analytics" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('reports', !Object.values(permissions.reports).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.reports.view, onChange: (e) => updatePermission('reports', 'view', e.target.checked) }), _jsx("span", { children: "View Reports" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.reports.export, onChange: (e) => updatePermission('reports', 'export', e.target.checked) }), _jsx("span", { children: "Export Reports" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.reports.viewFinancials, onChange: (e) => updatePermission('reports', 'viewFinancials', e.target.checked) }), _jsx("span", { children: "View Financials" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Settings Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('settings', !Object.values(permissions.settings).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.settings.view, onChange: (e) => updatePermission('settings', 'view', e.target.checked) }), _jsx("span", { children: "View Settings" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.settings.updateRestaurant, onChange: (e) => updatePermission('settings', 'updateRestaurant', e.target.checked) }), _jsx("span", { children: "Update Restaurant" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.settings.updateBranch, onChange: (e) => updatePermission('settings', 'updateBranch', e.target.checked) }), _jsx("span", { children: "Update Branch" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.settings.manageTaxes, onChange: (e) => updatePermission('settings', 'manageTaxes', e.target.checked) }), _jsx("span", { children: "Manage Taxes" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Table Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('tables', !Object.values(permissions.tables).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.tables.view, onChange: (e) => updatePermission('tables', 'view', e.target.checked) }), _jsx("span", { children: "View Tables" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.tables.create, onChange: (e) => updatePermission('tables', 'create', e.target.checked) }), _jsx("span", { children: "Create Tables" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.tables.update, onChange: (e) => updatePermission('tables', 'update', e.target.checked) }), _jsx("span", { children: "Update Tables" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.tables.delete, onChange: (e) => updatePermission('tables', 'delete', e.target.checked) }), _jsx("span", { children: "Delete Tables" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.tables.manageQR, onChange: (e) => updatePermission('tables', 'manageQR', e.target.checked) }), _jsx("span", { children: "Manage QR Codes" })] })] })] }), _jsxs("div", { className: "permission-category", children: [_jsxs("div", { className: "category-header", children: [_jsx("h3", { children: "Customer Management" }), _jsx("button", { className: "toggle-all-btn", onClick: () => toggleAllInCategory('customers', !Object.values(permissions.customers).every((v) => v)), children: "Toggle All" })] }), _jsxs("div", { className: "permission-items", children: [_jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.customers.view, onChange: (e) => updatePermission('customers', 'view', e.target.checked) }), _jsx("span", { children: "View Customers" })] }), _jsxs("label", { className: "permission-checkbox", children: [_jsx("input", { type: "checkbox", checked: permissions.customers.manage, onChange: (e) => updatePermission('customers', 'manage', e.target.checked) }), _jsx("span", { children: "Manage Customers" })] })] })] })] })) : null }), _jsxs("div", { className: "modal-footer", children: [_jsx(Button, { variant: "outline", onClick: onClose, disabled: saving, children: "Cancel" }), _jsxs(Button, { variant: "primary", onClick: handleSave, disabled: saving || loading, children: [_jsx(Save, { size: 18 }), saving ? 'Saving...' : 'Save Permissions'] })] })] }) }));
};
