// src/pages/restaurants/ViewRestaurant.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant.service';
import { StaffService } from '../../services/staff.service';
import { Restaurant } from '../../types/restaurant.types';
import { Staff, CreateStaffPayload } from '../../types/staff.types';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { createStaffSchema } from '../../validations/staff.validation';
import './ViewRestaurant.css';

export const ViewRestaurant: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { token } = useAuth();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Staff management state
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showAddStaffForm, setShowAddStaffForm] = useState(false);
    const [staffFormData, setStaffFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        staffType: 'waiter' as CreateStaffPayload['staffType'],
    });
    const [staffFormErrors, setStaffFormErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
        staffType?: string;
    }>({});

    useEffect(() => {
        if (id && token) {
            loadRestaurant();
            loadStaff();
        }
    }, [id, token]);

    const loadRestaurant = async () => {
        if (!id || !token) return;

        setLoading(true);
        setError('');

        try {
            const response = await RestaurantService.getRestaurant(token, id);

            if (response.success && response.data) {
                setRestaurant(response.data);
            } else {
                setError(response.message || 'Failed to load restaurant');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while loading the restaurant');
        } finally {
            setLoading(false);
        }
    };

    const loadStaff = async () => {
        if (!id || !token) return;

        setStaffLoading(true);

        try {
            const response = await StaffService.getStaffByRestaurant(token, id);

            if (response.success && response.data && Array.isArray(response.data.staff)) {
                setStaffList(response.data.staff);
            } else {
                setStaffList([]); // Ensure it's always an array
            }
        } catch (err: any) {
            console.error('Failed to load staff:', err.message);
            setStaffList([]);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleAddStaff = async () => {
        if (!id || !token) return;

        // Validate form data
        const result = createStaffSchema.safeParse(staffFormData);

        if (!result.success) {
            const fieldErrors: typeof staffFormErrors = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof typeof staffFormErrors;
                if (field in fieldErrors) return;
                fieldErrors[field] = err.message;
            });
            setStaffFormErrors(fieldErrors);
            return;
        }

        setStaffFormErrors({});
        setStaffLoading(true);

        try {
            const payload: CreateStaffPayload = {
                ...staffFormData,
                restaurantId: id,
            };

            const response = await StaffService.createStaff(token, payload);

            if (response.success) {
                alert('Staff added successfully!');
                setShowAddStaffForm(false);
                setStaffFormData({
                    name: '',
                    email: '',
                    phone: '',
                    password: '',
                    staffType: 'waiter' as CreateStaffPayload['staffType'],
                });
                loadStaff();
            } else {
                alert(response.message || 'Failed to add staff');
            }
        } catch (err: any) {
            alert(err.message || 'An error occurred while adding staff');
        } finally {
            setStaffLoading(false);
        }
    };

    const handleDeleteStaff = async (staffId: string, staffName: string) => {
        if (!token) return;

        if (!window.confirm(`Are you sure you want to delete "${staffName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await StaffService.deleteStaff(token, staffId);

            if (response.success) {
                alert('Staff deleted successfully');
                loadStaff();
            } else {
                alert(response.message || 'Failed to delete staff');
            }
        } catch (err: any) {
            alert(err.message || 'An error occurred while deleting staff');
        }
    };

    const handleDelete = async () => {
        if (!id || !token || !restaurant) return;

        if (!window.confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await RestaurantService.deleteRestaurant(token, id);

            if (response.success) {
                alert('Restaurant deleted successfully');
                navigate('/restaurants');
            } else {
                alert(response.message || 'Failed to delete restaurant');
            }
        } catch (err: any) {
            alert(err.message || 'An error occurred while deleting the restaurant');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="view-restaurant-container">
                <div className="loading-state">Loading restaurant details...</div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="view-restaurant-container">
                <div className="error-state">
                    <h2>Error</h2>
                    <p>{error || 'Restaurant not found'}</p>
                    <Button onClick={() => navigate('/restaurants')} variant="outline">
                        ← Back to List
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="view-restaurant-container">
            {/* Header */}
            <div className="view-restaurant-header">
                <div className="header-info">
                    <h1 className="page-title" data-testid="restaurant-name">
                        {restaurant.name}
                    </h1>
                    <p className="page-subtitle">/{restaurant.slug}</p>
                    <div className="status-badges">
                        <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                            {restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="type-badge">
                            {restaurant.type === 'single' ? 'Single Location' : 'Chain'}
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <Button variant="outline" onClick={() => navigate('/restaurants')}>
                        ← Back to List
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/restaurants/${id}/edit`)}
                    >
                        ✏️ Edit Restaurant
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        🗑️ Delete Restaurant
                    </Button>
                </div>
            </div>

            {/* Owner Information */}
            <div className="info-section">
                <h2 className="section-title">Owner Information</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label className="info-label">Full Name</label>
                        <p className="info-value" data-testid="owner-name">
                            {restaurant.owner.name}
                        </p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Email</label>
                        <p className="info-value" data-testid="owner-email">
                            {restaurant.owner.email}
                        </p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Phone</label>
                        <p className="info-value" data-testid="owner-phone">
                            {restaurant.owner.phone || '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Subscription Details */}
            <div className="info-section">
                <h2 className="section-title">Subscription Details</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label className="info-label">Plan</label>
                        <p className="info-value">
                            <span className={`plan-badge plan-${restaurant.subscription.plan}`}>
                                {restaurant.subscription.plan.charAt(0).toUpperCase() + restaurant.subscription.plan.slice(1)}
                            </span>
                        </p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Status</label>
                        <p className="info-value">
                            <span className={`status-badge ${restaurant.subscription.isActive ? 'active' : 'inactive'}`}>
                                {restaurant.subscription.isActive ? 'Active' : 'Expired/Inactive'}
                            </span>
                        </p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Start Date</label>
                        <p className="info-value">{formatDate(restaurant.subscription.startDate)}</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">End Date</label>
                        <p className="info-value">{formatDate(restaurant.subscription.endDate)}</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Branches Used</label>
                        <p className="info-value">
                            {restaurant.subscription.currentBranches} / {restaurant.subscription.maxBranches}
                        </p>
                    </div>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="info-section">
                <h2 className="section-title">Theme Settings</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label className="info-label">Primary Color</label>
                        <div className="color-display">
                            <span
                                className="color-box"
                                style={{ backgroundColor: restaurant.theme.primaryColor }}
                            ></span>
                            <p className="info-value">{restaurant.theme.primaryColor.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Secondary Color</label>
                        <div className="color-display">
                            <span
                                className="color-box"
                                style={{ backgroundColor: restaurant.theme.secondaryColor }}
                            ></span>
                            <p className="info-value">{restaurant.theme.secondaryColor.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Accent Color</label>
                        <div className="color-display">
                            <span
                                className="color-box"
                                style={{ backgroundColor: restaurant.theme.accentColor }}
                            ></span>
                            <p className="info-value">{restaurant.theme.accentColor.toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Font Family</label>
                        <p className="info-value" style={{ fontFamily: restaurant.theme.font }}>
                            {restaurant.theme.font}
                        </p>
                    </div>

                    {restaurant.theme.logo && (
                        <div className="info-item full-width">
                            <label className="info-label">Logo</label>
                            <div className="theme-image-container">
                                <img
                                    src={restaurant.theme.logo}
                                    alt="Restaurant Logo"
                                    className="theme-image logo"
                                />
                            </div>
                        </div>
                    )}

                    {restaurant.theme.bannerImage && (
                        <div className="info-item full-width">
                            <label className="info-label">Banner Image</label>
                            <div className="theme-image-container">
                                <img
                                    src={restaurant.theme.bannerImage}
                                    alt="Restaurant Banner"
                                    className="theme-image banner"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Default Settings */}
            <div className="info-section">
                <h2 className="section-title">Default Settings</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label className="info-label">Currency</label>
                        <p className="info-value">{restaurant.defaultSettings.currency}</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Service Charge</label>
                        <p className="info-value">{restaurant.defaultSettings.serviceChargePercentage}%</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Allow Branch Override</label>
                        <p className="info-value">
                            {restaurant.defaultSettings.allowBranchOverride ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Staff Management */}
            <div className="info-section">
                <div className="section-header">
                    <h2 className="section-title">Staff Management</h2>
                    <Button
                        variant="primary"
                        onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                        data-testid="add-staff-button"
                    >
                        {showAddStaffForm ? 'Cancel' : '+ Add Staff'}
                    </Button>
                </div>

                {/* Add Staff Form */}
                {showAddStaffForm && (
                    <div className="add-staff-form">
                        <h3 className="form-subtitle">Add New Staff Member</h3>
                        <div className="staff-form-grid">
                            <InputField
                                label="Full Name"
                                type="text"
                                value={staffFormData.name}
                                error={staffFormErrors.name}
                                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                                disabled={staffLoading}
                                data-testid="staff-name-input"
                            />

                            <InputField
                                label="Email"
                                type="email"
                                value={staffFormData.email}
                                error={staffFormErrors.email}
                                onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                                disabled={staffLoading}
                                data-testid="staff-email-input"
                            />

                            <InputField
                                label="Phone"
                                type="tel"
                                value={staffFormData.phone}
                                error={staffFormErrors.phone}
                                onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                                disabled={staffLoading}
                                data-testid="staff-phone-input"
                            />

                            <InputField
                                label="Password"
                                type="password"
                                value={staffFormData.password}
                                error={staffFormErrors.password}
                                onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                                disabled={staffLoading}
                                data-testid="staff-password-input"
                            />

                            <div className="input-group">
                                <label className="input-label">Role</label>
                                <select
                                    className={`role-select ${staffFormErrors.staffType ? 'error' : ''}`}
                                    value={staffFormData.staffType}
                                    onChange={(e) => setStaffFormData({ ...staffFormData, staffType: e.target.value as CreateStaffPayload['staffType'] })}
                                    disabled={staffLoading}
                                    data-testid="staff-role-select"
                                >
                                    <option value="owner">Owner</option>
                                    <option value="branch_manager">Branch Manager</option>
                                    <option value="manager">Manager</option>
                                    <option value="waiter">Waiter</option>
                                    <option value="kitchen_staff">Kitchen Staff</option>
                                    <option value="cashier">Cashier</option>
                                </select>
                                {staffFormErrors.staffType && (
                                    <span className="error-message">{staffFormErrors.staffType}</span>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button
                                variant="primary"
                                onClick={handleAddStaff}
                                loading={staffLoading}
                                data-testid="submit-staff-button"
                            >
                                Add Staff
                            </Button>
                        </div>
                    </div>
                )}

                {/* Staff List */}
                <div className="staff-list">
                    {staffLoading && !showAddStaffForm ? (
                        <div className="loading-state">Loading staff...</div>
                    ) : staffList.length === 0 ? (
                        <div className="empty-state">
                            <p>No staff members found. Add your first staff member above.</p>
                        </div>
                    ) : (
                        <div className="staff-table-container">
                            <table className="staff-table">
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
                                    {staffList.map((staff) => (
                                        <tr key={staff._id} data-testid={`staff-row-${staff._id}`}>
                                            <td data-testid="staff-name">{staff.name}</td>
                                            <td data-testid="staff-email">{staff.email}</td>
                                            <td>{staff.phone || '—'}</td>
                                            <td>
                                                <span className="role-badge">
                                                    {staff.staffType
                                                        .replace('_', ' ')
                                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                                                    {staff.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteStaff(staff._id, staff.name)}
                                                    data-testid={`delete-staff-${staff._id}`}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Metadata */}
            <div className="info-section">
                <h2 className="section-title">Metadata</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <label className="info-label">Restaurant ID</label>
                        <p className="info-value mono">{restaurant._id}</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Created At</label>
                        <p className="info-value">{formatDate(restaurant.createdAt)}</p>
                    </div>
                    <div className="info-item">
                        <label className="info-label">Last Updated</label>
                        <p className="info-value">{formatDate(restaurant.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};