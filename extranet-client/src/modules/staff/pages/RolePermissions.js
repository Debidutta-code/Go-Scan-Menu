import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/staff/pages/RolePermissions.tsx
import { useState, useEffect } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { Button } from '@/shared/components/Button';
import { Save, AlertCircle } from 'lucide-react';
import './RolePermissions.css';
const PERMISSION_CATEGORIES = [
    {
        key: 'orders',
        label: 'Order Management',
        description: 'Control access to order operations',
        permissions: [
            { key: 'view', label: 'View Orders' },
            { key: 'create', label: 'Create Orders' },
            { key: 'update', label: 'Update Orders' },
            { key: 'delete', label: 'Delete Orders' },
            { key: 'managePayment', label: 'Manage Payment' },
            { key: 'viewAllBranches', label: 'View All Branches Orders' },
        ],
    },
    {
        key: 'menu',
        label: 'Menu Management',
        description: 'Control access to menu operations',
        permissions: [
            { key: 'view', label: 'View Menu' },
            { key: 'create', label: 'Add Menu Items' },
            { key: 'update', label: 'Update Menu Items' },
            { key: 'delete', label: 'Delete Menu Items' },
            { key: 'manageCategories', label: 'Manage Categories' },
            { key: 'managePricing', label: 'Manage Pricing' },
        ],
    },
    {
        key: 'staff',
        label: 'Staff Management',
        description: 'Control access to staff operations',
        permissions: [
            { key: 'view', label: 'View Staff' },
            { key: 'create', label: 'Add Staff Members' },
            { key: 'update', label: 'Update Staff Details' },
            { key: 'delete', label: 'Delete Staff' },
            { key: 'manageRoles', label: 'Manage Roles & Permissions' },
        ],
    },
    {
        key: 'reports',
        label: 'Reports & Analytics',
        description: 'Control access to reports and analytics',
        permissions: [
            { key: 'view', label: 'View Reports' },
            { key: 'export', label: 'Export Reports' },
            { key: 'viewFinancials', label: 'View Financial Reports' },
        ],
    },
    {
        key: 'settings',
        label: 'Settings Management',
        description: 'Control access to settings',
        permissions: [
            { key: 'view', label: 'View Settings' },
            { key: 'updateRestaurant', label: 'Update Restaurant Settings' },
            { key: 'updateBranch', label: 'Update Branch Settings' },
            { key: 'manageTaxes', label: 'Manage Taxes' },
        ],
    },
    {
        key: 'tables',
        label: 'Table Management',
        description: 'Control access to table operations',
        permissions: [
            { key: 'view', label: 'View Tables' },
            { key: 'create', label: 'Create Tables' },
            { key: 'update', label: 'Update Tables' },
            { key: 'delete', label: 'Delete Tables' },
            { key: 'manageQR', label: 'Manage QR Codes' },
        ],
    },
    {
        key: 'customers',
        label: 'Customer Management',
        description: 'Control access to customer operations',
        permissions: [
            { key: 'view', label: 'View Customers' },
            { key: 'manage', label: 'Manage Customer Details' },
        ],
    },
];
export const RolePermissions = () => {
    const { token, staff: currentStaff } = useStaffAuth();
    const [roles, setRoles] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    useEffect(() => {
        fetchRoles();
    }, []);
    useEffect(() => {
        if (selectedRoleId) {
            const role = roles.find(r => r._id === selectedRoleId);
            if (role)
                setPermissions(role.permissions);
        }
    }, [selectedRoleId, roles]);
    const fetchRoles = async () => {
        if (!token)
            return;
        try {
            setFetchLoading(true);
            const response = await fetch(`/api/v1/roles?restaurantId=${currentStaff?.restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRoles(data.data);
                if (data.data.length > 0)
                    setSelectedRoleId(data.data[0]._id);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to fetch roles');
        }
        finally {
            setFetchLoading(false);
        }
    };
    const handlePermissionChange = (category, permission, value) => {
        if (!permissions)
            return;
        setPermissions(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [permission]: value,
            },
        }));
        setSuccessMessage(null);
    };
    const handleSelectAll = (category, value) => {
        if (!permissions)
            return;
        const categoryPerms = PERMISSION_CATEGORIES.find(c => c.key === category);
        if (!categoryPerms)
            return;
        const updatedCategory = {};
        categoryPerms.permissions.forEach(perm => {
            updatedCategory[perm.key] = value;
        });
        setPermissions(prev => ({
            ...prev,
            [category]: updatedCategory,
        }));
        setSuccessMessage(null);
    };
    const handleSave = async () => {
        if (!token || !selectedRoleId || !permissions)
            return;
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            const response = await fetch(`/api/v1/roles/${selectedRoleId}/permissions`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(permissions)
            });
            const data = await response.json();
            if (data.success) {
                setSuccessMessage(`Permissions updated successfully!`);
                // Update local roles state
                setRoles(prev => prev.map(r => r._id === selectedRoleId ? { ...r, permissions } : r));
            }
            else {
                throw new Error(data.message || 'Failed to update');
            }
        }
        catch (err) {
            setError(err.message || 'Failed to update permissions');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "role-permissions-layout", "data-testid": "role-permissions-page", children: [_jsxs("div", { className: "permissions-page-toolbar", children: [_jsx("h1", { className: "permissions-page-title", children: "Role Permissions" }), _jsxs("div", { className: "permissions-toolbar-actions", children: [_jsxs("div", { className: "role-selector-wrapper", children: [_jsx("label", { htmlFor: "roleSelect", className: "role-selector-label", children: "Role:" }), _jsx("select", { id: "roleSelect", value: selectedRoleId, onChange: (e) => setSelectedRoleId(e.target.value), className: "role-selector", disabled: loading || fetchLoading, "data-testid": "role-selector", children: roles.map(role => (_jsx("option", { value: role._id, children: role.displayName }, role._id))) })] }), _jsxs(Button, { variant: "primary", onClick: handleSave, loading: loading, disabled: loading || fetchLoading || !permissions, size: "sm", className: "save-btn", "data-testid": "save-permissions-button", children: [_jsx(Save, { size: 18 }), "Save Changes"] })] })] }), error && (_jsxs("div", { className: "error-banner", "data-testid": "error-message", children: [_jsx(AlertCircle, { size: 18 }), error] })), successMessage && (_jsx("div", { className: "success-banner", "data-testid": "success-message", children: successMessage })), _jsx("div", { className: "role-permissions-content", children: fetchLoading ? (_jsx("div", { className: "loading-state", children: "Loading permissions..." })) : !permissions ? (_jsx("div", { className: "empty-state", children: "Select a role to manage permissions" })) : (_jsx("div", { className: "permissions-grid", children: PERMISSION_CATEGORIES.map(category => {
                        const categoryPerms = permissions[category.key];
                        const allChecked = category.permissions.every(p => categoryPerms[p.key]);
                        return (_jsxs("div", { className: "permission-category-card", "data-testid": `category-${category.key}`, children: [_jsxs("div", { className: "category-header", children: [_jsxs("div", { children: [_jsx("h3", { className: "category-title", children: category.label }), _jsx("p", { className: "category-description", children: category.description })] }), _jsx("button", { className: "select-all-button", onClick: () => handleSelectAll(category.key, !allChecked), disabled: loading, "data-testid": `select-all-${category.key}`, children: allChecked ? 'Deselect All' : 'Select All' })] }), _jsx("div", { className: "permissions-list", children: category.permissions.map(permission => (_jsxs("label", { className: "permission-checkbox-label", "data-testid": `permission-${category.key}-${permission.key}`, children: [_jsx("input", { type: "checkbox", checked: categoryPerms[permission.key] || false, onChange: (e) => handlePermissionChange(category.key, permission.key, e.target.checked), disabled: loading, className: "permission-checkbox" }), _jsx("span", { className: "permission-label-text", children: permission.label })] }, permission.key))) })] }, category.key));
                    }) })) })] }));
};
