// src/pages/staff/StaffList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { StaffService } from '../../services/staff.service';
import { Staff } from '../../types/staff.types';
import { StaffType } from '../../types/staffPermissions.types';
import { Button } from '../../components/ui/Button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import './StaffList.css';

const STAFF_TYPE_LABELS: Record<StaffType, string> = {
    [StaffType.SUPER_ADMIN]: 'Super Admin',
    [StaffType.OWNER]: 'Owner',
    [StaffType.BRANCH_MANAGER]: 'Branch Manager',
    [StaffType.MANAGER]: 'Manager',
    [StaffType.WAITER]: 'Waiter',
    [StaffType.KITCHEN_STAFF]: 'Kitchen Staff',
    [StaffType.CASHIER]: 'Cashier',
};

export const StaffList: React.FC = () => {
    const navigate = useNavigate();
    const { token, staff: currentStaff } = useStaffAuth();

    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        if (!token || !currentStaff?.restaurantId) return;

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
            setError(err.message || 'Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (staffId: string) => {
        if (!token) return;
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            await StaffService.deleteStaff(token, staffId);
            fetchStaff();
        } catch (err: any) {
            alert(err.message || 'Failed to delete staff');
        }
    };

    const filteredStaff = staffList.filter((staff) => {
        const matchesSearch =
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.phone.includes(searchQuery);

        const matchesRole = filterRole === 'all' || staff.staffType === filterRole;

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
                    {Object.entries(STAFF_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
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
                            {filteredStaff.map((staff) => (
                                <tr key={staff._id} data-testid={`staff-row-${staff._id}`}>
                                    <td className="staff-name">{staff.name}</td>
                                    <td className="staff-email">{staff.email}</td>
                                    <td className="staff-phone">{staff.phone}</td>
                                    <td>
                                        <span className="role-badge" data-testid={`role-badge-${staff.staffType}`}>
                                            {STAFF_TYPE_LABELS[staff.staffType]}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`} data-testid={`status-${staff._id}`}>
                                            {staff.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
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
                                            onClick={() => handleDelete(staff._id)}
                                            title="Delete"
                                            data-testid={`delete-button-${staff._id}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="staff-count" data-testid="staff-count">
                Showing {filteredStaff.length} of {staffList.length} staff members
            </div>
        </div>
    );
};