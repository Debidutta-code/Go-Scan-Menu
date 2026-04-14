// src/pages/staff/StaffList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { StaffPermissionsService } from '@/modules/staff/services/staffPermissions.service';
import { Staff } from '@/shared/types/staff.types';
import { StaffRole, Role, RoleLevel } from '@/shared/types/role.types';
import { Button } from '@/shared/components/Button';
import { PermissionsModal } from '@/modules/staff/components/PermissionsModal';
import { Plus, Edit, Trash2, Search, Shield, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import './StaffList.css';

export const StaffList: React.FC = () => {
    const navigate = useNavigate();
    const { token, staff: currentStaff } = useStaffAuth();

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    // Permissions modal state
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [selectedStaffType, setSelectedStaffType] = useState<StaffRole | null>(null);

    useEffect(() => {
        fetchStaff();
        fetchRoles();
    }, []);

    const fetchStaff = async () => {
        if (!token || !currentStaff?.restaurantId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await StaffService.getStaffByRestaurant(
                token,
                currentStaff.restaurantId,
                1,
                100
            );
            if (response.data && response.data.staff) {
                setStaffList(response.data.staff);
            } else {
                setStaffList([]);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        if (!token || !currentStaff?.restaurantId) return;
        try {
            const response = await StaffPermissionsService.getAllRestaurantRoles(token, currentStaff.restaurantId);
            if (response.data) {
                setAvailableRoles(response.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch roles', err);
        }
    };

    // Get current user's role level
    const currentUserLevel = useMemo(() => {
        if (!currentStaff) return 99;
        if (currentStaff.roleName === StaffRole.SUPER_ADMIN) return RoleLevel.PLATFORM;

        const currentRole = availableRoles.find(r => r.name === currentStaff.roleName);
        if (currentRole) return currentRole.level;

        const roleLevelMap: Record<string, number> = {
            [StaffRole.SUPER_ADMIN]: 1,
            [StaffRole.OWNER]: 2,
            [StaffRole.BRANCH_MANAGER]: 3,
            [StaffRole.MANAGER]: 4,
            [StaffRole.WAITER]: 5,
            [StaffRole.KITCHEN_STAFF]: 5,
            [StaffRole.CASHIER]: 5,
        };
        return roleLevelMap[currentStaff.roleName as string] || 99;
    }, [currentStaff, availableRoles]);

    // Check if current user can manage a specific staff member based on hierarchy
    const canManageStaff = (staffMember: Staff) => {
        if (currentStaff?.roleName === StaffRole.SUPER_ADMIN) return true;

        const targetRole = availableRoles.find(r => r.name === staffMember.roleName);
        const targetLevel = targetRole ? targetRole.level : 99;

        // Numerically greater level means lower rank
        return targetLevel > currentUserLevel;
    };

    const handleDelete = async (staffMember: Staff) => {
        if (!token) return;

        if (!canManageStaff(staffMember)) {
            toast.error('Access denied - This is a top level role, ask for permission.', {
                icon: <ShieldAlert size={20} />
            });
            return;
        }

        if (!confirm(`Are you sure you want to delete ${staffMember.name}?`)) return;

        try {
            await StaffService.deleteStaff(token, staffMember._id);
            toast.success('Staff member deleted successfully');
            fetchStaff();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete staff');
        }
    };

    const handleManagePermissions = (staffType: StaffRole) => {
        // Find the role level for this staff type
        const targetRole = availableRoles.find(r => r.name === staffType);
        if (currentStaff?.roleName !== StaffRole.SUPER_ADMIN && targetRole && targetRole.level <= currentUserLevel) {
            toast.error('Access denied - This is a top level role, ask for permission.', {
                icon: <ShieldAlert size={20} />
            });
            return;
        }

        setSelectedStaffType(staffType);
        setIsPermissionsModalOpen(true);
    };

    const handlePermissionsSaved = () => {
        toast.success('Permissions updated successfully!');
    };

    const filteredStaff = staffList.filter((staff) => {
        const matchesSearch =
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.phone.includes(searchQuery);

        const matchesRole = filterRole === 'all' || staff.staffType === filterRole || staff.roleName === filterRole;

        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="staff-list-container">
                <div className="loading-state">Loading staff...</div>
            </div>
        );
    }

    return (
        <div className="staff-list-container" data-testid="staff-list-page">
            <div className="staff-list-header">
                <div>
                    <h1 className="staff-list-title">Team Management</h1>
                    <p className="staff-list-subtitle">Manage your restaurant staff members</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/staff/team/add')}
                    data-testid="add-staff-button"
                >
                    <Plus size={18} />
                    Add Staff Member
                </Button>
            </div>

            {error && (
                <div className="error-banner" data-testid="error-message">
                    {error}
                </div>
            )}

            <div className="staff-list-filters">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        data-testid="search-input"
                    />
                </div>

                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="role-filter"
                    data-testid="role-filter"
                >
                    <option value="all">All Roles</option>
                    {availableRoles.map(role => (
                        <option key={role.name} value={role.name}>{role.displayName}</option>
                    ))}
                </select>
            </div>

            {filteredStaff.length === 0 ? (
                <div className="empty-state" data-testid="empty-state">
                    <p>No staff members found</p>
                    <Button variant="outline" onClick={() => navigate('/staff/team/add')}>
                        Add Your First Staff Member
                    </Button>
                </div>
            ) : (
                <div className="staff-table-container">
                    <table className="staff-table" data-testid="staff-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((staff) => {
                                const manageable = canManageStaff(staff);
                                return (
                                    <tr key={staff._id} data-testid={`staff-row-${staff._id}`} className={!manageable ? 'row-readonly' : ''}>
                                        <td className="staff-name">{staff.name}</td>
                                        <td className="staff-email">{staff.email}</td>
                                        <td className="staff-phone">{staff.phone}</td>
                                        <td>
                                            <span className="role-badge" data-testid={`role-badge-${staff.staffType}`}>
                                                {availableRoles.find(r => r.name === (staff.roleName || staff.staffType))?.displayName || staff.roleName || staff.staffType}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`} data-testid={`status-${staff._id}`}>
                                                {staff.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="action-buttons">
                                            {manageable ? (
                                                <>
                                                    <button
                                                        className="icon-button permissions"
                                                        onClick={() => handleManagePermissions((staff.roleName || staff.staffType) as StaffRole)}
                                                        title="Manage Permissions"
                                                        data-testid={`permissions-button-${staff._id}`}
                                                    >
                                                        <Shield size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-button edit"
                                                        onClick={() => navigate(`/staff/team/edit/${staff._id}`)}
                                                        title="Edit"
                                                        data-testid={`edit-button-${staff._id}`}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        className="icon-button delete"
                                                        onClick={() => handleDelete(staff)}
                                                        title="Delete"
                                                        data-testid={`delete-button-${staff._id}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="readonly-badge" title="Insufficient hierarchy level to manage this staff member">
                                                    <Shield size={14} /> Read-only
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="staff-count" data-testid="staff-count">
                Showing {filteredStaff.length} of {staffList.length} staff members
            </div>

            {/* Permissions Management Modal */}
            {selectedStaffType && currentStaff && (
                <PermissionsModal
                    isOpen={isPermissionsModalOpen}
                    onClose={() => setIsPermissionsModalOpen(false)}
                    restaurantId={currentStaff.restaurantId}
                    staffType={selectedStaffType as any}
                    token={token || ''}
                    onSave={handlePermissionsSaved}
                />
            )}
        </div>
    );
};
