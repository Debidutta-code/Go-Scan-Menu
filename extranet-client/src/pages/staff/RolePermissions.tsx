// src/pages/staff/RolePermissions.tsx
import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { StaffPermissionsService } from '../../services/staffPermissions.service';
import { Button } from '../../components/ui/Button';
import { StaffType, IPermissions } from '../../types/staffPermissions.types';
import { Save, AlertCircle } from 'lucide-react';
import './RolePermissions.css';

const STAFF_TYPE_OPTIONS = [
    { value: StaffType.OWNER, label: 'Owner' },
    { value: StaffType.BRANCH_MANAGER, label: 'Branch Manager' },
    { value: StaffType.MANAGER, label: 'Manager' },
    { value: StaffType.WAITER, label: 'Waiter' },
    { value: StaffType.KITCHEN_STAFF, label: 'Kitchen Staff' },
    { value: StaffType.CASHIER, label: 'Cashier' },
];

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

const DEFAULT_PERMISSIONS: IPermissions = {
    orders: { view: false, create: false, update: false, delete: false, managePayment: false, viewAllBranches: false },
    menu: { view: false, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
    staff: { view: false, create: false, update: false, delete: false, manageRoles: false },
    reports: { view: false, export: false, viewFinancials: false },
    settings: { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
    tables: { view: false, create: false, update: false, delete: false, manageQR: false },
    customers: { view: false, manage: false },
};

export const RolePermissions: React.FC = () => {
    const { token, staff: currentStaff } = useStaffAuth();

    const [selectedRole, setSelectedRole] = useState<StaffType>(StaffType.WAITER);
    const [permissions, setPermissions] = useState<IPermissions>(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchPermissions();
    }, [selectedRole]);

    const fetchPermissions = async () => {
        if (!token || !currentStaff?.restaurantId) return;

        try {
            setFetchLoading(true);
            setError(null);
            const response = await StaffPermissionsService.getPermissionsForStaffType(
                token,
                currentStaff.restaurantId,
                selectedRole
            );
            if (response.data && response.data.permissions) {

                setPermissions(response.data.permissions);
            } else {
                setPermissions(DEFAULT_PERMISSIONS);
            }
        } catch (err: any) {
            if (err.message.includes('not found')) {
                // No permissions set yet, use defaults
                setPermissions(DEFAULT_PERMISSIONS);
            } else {
                setError(err.message || 'Failed to fetch permissions');
            }
        } finally {
            setFetchLoading(false);
        }
    };

    const handlePermissionChange = (category: string, permission: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof IPermissions],
                [permission]: value,
            },
        }));
        setSuccessMessage(null);
    };

    const handleSelectAll = (category: string, value: boolean) => {
        const categoryPerms = PERMISSION_CATEGORIES.find(c => c.key === category);
        if (!categoryPerms) return;

        const updatedCategory: any = {};
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
        if (!token || !currentStaff?.restaurantId) return;

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            await StaffPermissionsService.updatePermissionsForStaffType(
                token,
                currentStaff.restaurantId,
                selectedRole,
                { permissions }
            );

            setSuccessMessage(`Permissions updated successfully for ${STAFF_TYPE_OPTIONS.find(o => o.value === selectedRole)?.label}!`);
        } catch (err: any) {
            setError(err.message || 'Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="role-permissions-layout" data-testid="role-permissions-page">
            {/* Page Actions Toolbar */}
            <div className="permissions-page-toolbar">
                <h1 className="permissions-page-title">Role Permissions</h1>

                <div className="permissions-toolbar-actions">
                    <div className="role-selector-wrapper">
                        <label htmlFor="roleSelect" className="role-selector-label">
                            Role:
                        </label>
                        <select
                            id="roleSelect"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as StaffType)}
                            className="role-selector"
                            disabled={loading || fetchLoading}
                            data-testid="role-selector"
                        >
                            {STAFF_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={loading}
                        disabled={loading || fetchLoading}
                        size="sm"
                        className="save-btn"
                        data-testid="save-permissions-button"
                    >
                        <Save size={18} />
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="error-banner" data-testid="error-message">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="success-banner" data-testid="success-message">
                    {successMessage}
                </div>
            )}

            {/* Main Content */}
            <div className="role-permissions-content">
                {fetchLoading ? (
                    <div className="loading-state">Loading permissions...</div>
                ) : (
                    <div className="permissions-grid">
                        {PERMISSION_CATEGORIES.map(category => {
                            const categoryPerms = permissions[category.key as keyof IPermissions] as any;
                            const allChecked = category.permissions.every(p => categoryPerms[p.key]);

                            return (
                                <div key={category.key} className="permission-category-card" data-testid={`category-${category.key}`}>
                                    <div className="category-header">
                                        <div>
                                            <h3 className="category-title">{category.label}</h3>
                                            <p className="category-description">{category.description}</p>
                                        </div>
                                        <button
                                            className="select-all-button"
                                            onClick={() => handleSelectAll(category.key, !allChecked)}
                                            disabled={loading}
                                            data-testid={`select-all-${category.key}`}
                                        >
                                            {allChecked ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>

                                    <div className="permissions-list">
                                        {category.permissions.map(permission => (
                                            <label
                                                key={permission.key}
                                                className="permission-checkbox-label"
                                                data-testid={`permission-${category.key}-${permission.key}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={categoryPerms[permission.key] || false}
                                                    onChange={(e) => handlePermissionChange(category.key, permission.key, e.target.checked)}
                                                    disabled={loading}
                                                    className="permission-checkbox"
                                                />
                                                <span className="permission-label-text">{permission.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};