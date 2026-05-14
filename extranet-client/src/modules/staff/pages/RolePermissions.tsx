// src/pages/staff/RolePermissions.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { Button } from '@/shared/components/Button';
import { SharedDropdown, DropdownOption, DropdownTrigger } from '@/shared/components/SharedDropdown/SharedDropdown';
import { IPermissions } from '@/shared/types/staffPermissions.types';
import { StaffRole, Role, RoleLevel } from '@/shared/types/role.types';
import {
    Save,
    AlertCircle,
    ShieldAlert,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    BarChart3,
    Settings2,
    LayoutGrid,
    UserCheck,
    ChevronDown,
} from 'lucide-react';
import { toast } from 'react-toastify';
import './RolePermissions.css';
import { RolePermissionsSkeleton } from '../components';

// ── Per-category visual config (neutral — no bright colours) ─────────────────
const CATEGORY_META: Record<string, { icon: React.ReactNode }> = {
    orders:    { icon: <ShoppingCart    size={14} /> },
    menu:      { icon: <UtensilsCrossed size={14} /> },
    staff:     { icon: <Users           size={14} /> },
    reports:   { icon: <BarChart3       size={14} /> },
    settings:  { icon: <Settings2       size={14} /> },
    tables:    { icon: <LayoutGrid      size={14} /> },
    customers: { icon: <UserCheck       size={14} /> },
};

const PERMISSION_CATEGORIES = [
    {
        key: 'orders',
        label: 'Order Management',
        description: 'Control access to order operations',
        permissions: [
            { key: 'view',            label: 'View orders' },
            { key: 'create',          label: 'Create orders' },
            { key: 'update',          label: 'Update orders' },
            { key: 'delete',          label: 'Delete orders' },
            { key: 'managePayment',   label: 'Manage payment' },
            { key: 'viewAllBranches', label: 'View all branches' },
        ],
    },
    {
        key: 'menu',
        label: 'Menu Management',
        description: 'Control access to menu operations',
        permissions: [
            { key: 'view',             label: 'View menu' },
            { key: 'create',           label: 'Add menu items' },
            { key: 'update',           label: 'Update menu items' },
            { key: 'delete',           label: 'Delete menu items' },
            { key: 'manageCategories', label: 'Manage categories' },
            { key: 'managePricing',    label: 'Manage pricing' },
        ],
    },
    {
        key: 'staff',
        label: 'Staff Management',
        description: 'Control access to staff operations',
        permissions: [
            { key: 'view',        label: 'View staff' },
            { key: 'create',      label: 'Add staff members' },
            { key: 'update',      label: 'Update staff details' },
            { key: 'delete',      label: 'Delete staff' },
            { key: 'manageRoles', label: 'Manage roles & permissions' },
        ],
    },
    {
        key: 'reports',
        label: 'Reports & Analytics',
        description: 'Control access to reports and analytics',
        permissions: [
            { key: 'view',           label: 'View reports' },
            { key: 'export',         label: 'Export reports' },
            { key: 'viewFinancials', label: 'View financial reports' },
        ],
    },
    {
        key: 'settings',
        label: 'Settings',
        description: 'Control access to settings',
        permissions: [
            { key: 'view',             label: 'View settings' },
            { key: 'updateRestaurant', label: 'Update restaurant settings' },
            { key: 'updateBranch',     label: 'Update branch settings' },
            { key: 'manageTaxes',      label: 'Manage taxes' },
        ],
    },
    {
        key: 'tables',
        label: 'Table Management',
        description: 'Control access to table operations',
        permissions: [
            { key: 'view',     label: 'View tables' },
            { key: 'create',   label: 'Create tables' },
            { key: 'update',   label: 'Update tables' },
            { key: 'delete',   label: 'Delete tables' },
            { key: 'manageQR', label: 'Manage QR codes' },
        ],
    },
    {
        key: 'customers',
        label: 'Customer Management',
        description: 'Control access to customer operations',
        permissions: [
            { key: 'view',   label: 'View customers' },
            { key: 'manage', label: 'Manage customer details' },
        ],
    },
];

const DEFAULT_PERMISSIONS: IPermissions = {
    orders:    { view: false, create: false, update: false, delete: false, managePayment: false, viewAllBranches: false },
    menu:      { view: false, create: false, update: false, delete: false, manageCategories: false, managePricing: false },
    staff:     { view: false, create: false, update: false, delete: false, manageRoles: false },
    reports:   { view: false, export: false, viewFinancials: false },
    settings:  { view: false, updateRestaurant: false, updateBranch: false, manageTaxes: false },
    tables:    { view: false, create: false, update: false, delete: false, manageQR: false },
    customers: { view: false, manage: false },
};

export const RolePermissions: React.FC = () => {
    const { token, staff: currentStaff } = useStaffAuth();

    const [availableRoles, setAvailableRoles]     = useState<Role[]>([]);
    const [selectedRoleName, setSelectedRoleName] = useState<StaffRole | ''>('');
    const [permissions, setPermissions]           = useState<IPermissions>(DEFAULT_PERMISSIONS);
    const [loading, setLoading]                   = useState(false);
    const [fetchLoading, setFetchLoading]         = useState(false);
    const [error, setError]                       = useState<string | null>(null);
    const [successMessage, setSuccessMessage]     = useState<string | null>(null);

    const currentUserLevel = useMemo(() => {
        if (!currentStaff) return 99;
        const roleName = (
            currentStaff.roleName ||
            (currentStaff as any).staffType ||
            (currentStaff.roleId && typeof currentStaff.roleId === 'object' ? currentStaff.roleId.name : '') ||
            ''
        ).toLowerCase();

        if (roleName === StaffRole.SUPER_ADMIN) return RoleLevel.PLATFORM;
        if ((currentStaff as any).roleLevel) return (currentStaff as any).roleLevel;
        if (currentStaff.roleId && typeof currentStaff.roleId === 'object' && (currentStaff.roleId as any).level)
            return (currentStaff.roleId as any).level;

        const currentRole = availableRoles.find(r => r.name === roleName);
        if (currentRole) return currentRole.level;

        const map: Record<string, number> = {
            super_admin: 1, owner: 2, restaurant_owner: 2,
            branch_manager: 3, manager: 4, store_manager: 4,
            waiter: 5, kitchen_staff: 5, kitchen: 5, cashier: 5,
        };
        return map[roleName] || 99;
    }, [currentStaff, availableRoles]);

    const manageableRoles = useMemo(() => {
        const userRoleName = (
            currentStaff?.roleName ||
            (currentStaff as any)?.staffType ||
            (currentStaff?.roleId && typeof currentStaff.roleId === 'object' ? currentStaff.roleId.name : '') ||
            ''
        ).toLowerCase();
        if (userRoleName === StaffRole.SUPER_ADMIN) return availableRoles;
        return availableRoles.filter(role => role.level > currentUserLevel);
    }, [availableRoles, currentUserLevel, currentStaff]);

    useEffect(() => { fetchRoles(); }, []);
    useEffect(() => { if (selectedRoleName) fetchPermissions(); }, [selectedRoleName]);
    useEffect(() => {
        if (manageableRoles.length > 0 && !selectedRoleName)
            setSelectedRoleName(manageableRoles[0].name);
    }, [manageableRoles]);

    const fetchRoles = async () => {
        if (!token || !currentStaff?.restaurantId) return;
        try {
            setFetchLoading(true);
            const res = await StaffPermissionsService.getAllRestaurantRoles(token, currentStaff.restaurantId);
            if (res.data) setAvailableRoles(res.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch roles');
        } finally {
            setFetchLoading(false);
        }
    };

    const fetchPermissions = async () => {
        if (!token || !currentStaff?.restaurantId || !selectedRoleName) return;
        try {
            setFetchLoading(true);
            setError(null);
            const res = await StaffPermissionsService.getPermissionsForStaffType(
                token, currentStaff.restaurantId, selectedRoleName as any,
            );
            setPermissions(res.data?.permissions ?? DEFAULT_PERMISSIONS);
        } catch (err: any) {
            setPermissions(DEFAULT_PERMISSIONS);
            if (!err.message.includes('not found')) setError(err.message || 'Failed to fetch permissions');
        } finally {
            setFetchLoading(false);
        }
    };

    const handlePermissionChange = (category: string, permission: string, value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [category]: { ...prev[category as keyof IPermissions], [permission]: value },
        }));
        setSuccessMessage(null);
    };

    const handleSelectAll = (category: string, value: boolean) => {
        const cat = PERMISSION_CATEGORIES.find(c => c.key === category);
        if (!cat) return;
        const updated: any = {};
        cat.permissions.forEach(p => { updated[p.key] = value; });
        setPermissions(prev => ({ ...prev, [category]: updated }));
        setSuccessMessage(null);
    };

    const handleInitialize = async () => {
        if (!token || !currentStaff?.restaurantId) return;
        try {
            setLoading(true);
            await StaffPermissionsService.initializeAllPermissions(token, currentStaff.restaurantId);
            toast.success('Restaurant permissions initialized!');
            await fetchRoles();
        } catch (err: any) {
            setError(err.message || 'Failed to initialize permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!token || !currentStaff?.restaurantId || !selectedRoleName) return;
        const targetRole = availableRoles.find(r => r.name === selectedRoleName);
        if (currentStaff.roleName !== StaffRole.SUPER_ADMIN && targetRole && targetRole.level <= currentUserLevel) {
            toast.error('Access denied — this is a higher-level role.', { icon: <ShieldAlert size={18} /> });
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            await StaffPermissionsService.updatePermissionsForStaffType(
                token, currentStaff.restaurantId, selectedRoleName as any, { permissions },
            );
            const roleLabel = manageableRoles.find(r => r.name === selectedRoleName)?.displayName || selectedRoleName;
            setSuccessMessage(`Permissions updated for ${roleLabel}`);
            toast.success(`Permissions updated for ${roleLabel}`);
        } catch (err: any) {
            setError(err.message || 'Failed to update permissions');
            toast.error(err.message || 'Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    // ── Build SharedDropdown options from manageable roles ──────────────────
    const dropdownOptions: DropdownOption[] = manageableRoles.map(role => ({
        value: role.name,
        label: role.displayName,
    }));

    const selectedRole = manageableRoles.find(r => r.name === selectedRoleName);
    const dropdownTrigger: DropdownTrigger = {
        label: selectedRole?.displayName ?? (fetchLoading ? 'Loading…' : 'Select role'),
    };

    // ── Show skeleton on initial role fetch ─────────────────────────────────
    if (fetchLoading && availableRoles.length === 0) {
        return (
            <div className="rp-layout" data-testid="role-permissions-page">
                <RolePermissionsSkeleton />
            </div>
        );
    }

    return (
        <div className="rp-layout" data-testid="role-permissions-page">

            {/* Toolbar */}
            <div className="rp-toolbar">
                <div className="rp-toolbar-left">
                    <h1 className="rp-title">Role Permissions</h1>
                    <p className="rp-subtitle">Configure access controls for each role</p>
                </div>

                <div className="rp-toolbar-actions">
                    {manageableRoles.length > 0 && (
                        <div className="rp-role-wrap">
                            <span className="rp-role-label">Role</span>
                            <SharedDropdown
                                value={selectedRoleName}
                                options={dropdownOptions}
                                trigger={dropdownTrigger}
                                onChange={val => setSelectedRoleName(val as StaffRole)}
                                variant="compact"
                                panelWidth={220}
                                loading={fetchLoading}
                                disabled={loading || fetchLoading || manageableRoles.length === 0}
                                testId="role-selector"
                            />
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        loading={loading}
                        disabled={loading || fetchLoading || manageableRoles.length === 0}
                        size="sm"
                        data-testid="save-permissions-button"
                    >
                        <Save size={14} />
                        Save changes
                    </Button>
                </div>
            </div>

            {/* Banners */}
            {error && (
                <div className="rp-banner rp-banner--error" data-testid="error-message">
                    <AlertCircle size={13} /> {error}
                </div>
            )}
            {successMessage && (
                <div className="rp-banner rp-banner--success" data-testid="success-message">
                    {successMessage}
                </div>
            )}

            {/* Content */}
            <div className="rp-content">
                {fetchLoading && availableRoles.length > 0 ? (
                    /* Subsequent fetch: show grid skeleton inline */
                    <div className="rp-grid">
                        {/* Re-use the grid portion of the skeleton inline */}
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="rp-card" style={{ minHeight: 180, opacity: 0.5 }} />
                        ))}
                    </div>
                ) : manageableRoles.length === 0 ? (
                    <div className="rp-empty">
                        <span className="rp-empty-shield"><ShieldAlert size={26} /></span>
                        <p className="rp-empty-title">No manageable roles</p>
                        <p className="rp-empty-sub">You don't have permission to manage any roles.</p>
                        {currentStaff?.roleName === 'owner' && (
                            <Button variant="primary" onClick={handleInitialize} loading={loading} size="sm">
                                Initialize restaurant roles
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="rp-grid">
                        {PERMISSION_CATEGORIES.map(category => {
                            const meta         = CATEGORY_META[category.key];
                            const catPerms     = permissions[category.key as keyof IPermissions] as any;
                            const enabledCount = category.permissions.filter(p => catPerms[p.key]).length;
                            const total        = category.permissions.length;
                            const allOn        = enabledCount === total;

                            return (
                                <div
                                    key={category.key}
                                    className="rp-card"
                                    data-testid={`category-${category.key}`}
                                >
                                    {/* Card header */}
                                    <div className="rp-card-head">
                                        <div className="rp-card-meta">
                                            <span className="rp-icon-chip" aria-hidden="true">
                                                {meta.icon}
                                            </span>
                                            <div>
                                                <h3 className="rp-card-title">{category.label}</h3>
                                                <p className="rp-card-desc">{category.description}</p>
                                            </div>
                                        </div>

                                        <div className="rp-card-controls">
                                            <span className={`rp-count${enabledCount > 0 ? ' rp-count--active' : ''}`}>
                                                {enabledCount}/{total}
                                            </span>
                                            <button
                                                className="rp-select-all"
                                                onClick={() => handleSelectAll(category.key, !allOn)}
                                                disabled={loading}
                                                data-testid={`select-all-${category.key}`}
                                            >
                                                {allOn ? 'Clear all' : 'Select all'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Permission rows */}
                                    <ul className="rp-perm-list">
                                        {category.permissions.map(permission => {
                                            const checked = catPerms[permission.key] || false;
                                            const uid = `toggle-${category.key}-${permission.key}`;
                                            return (
                                                <li
                                                    key={permission.key}
                                                    className={`rp-perm-row${checked ? ' rp-perm-row--on' : ''}`}
                                                    data-testid={`permission-${category.key}-${permission.key}`}
                                                >
                                                    <label htmlFor={uid} className="rp-perm-label">
                                                        {permission.label}
                                                    </label>
                                                    <label htmlFor={uid} className="rp-toggle" aria-label={permission.label}>
                                                        <input
                                                            type="checkbox"
                                                            id={uid}
                                                            checked={checked}
                                                            onChange={e =>
                                                                handlePermissionChange(category.key, permission.key, e.target.checked)
                                                            }
                                                            disabled={loading}
                                                        />
                                                        <span className="rp-toggle-track">
                                                            <span className="rp-toggle-thumb" />
                                                        </span>
                                                    </label>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
