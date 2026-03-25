import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/restaurant/pages/ViewRestaurant.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import { StaffService } from '@/modules/staff/services/staff.service';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { createStaffSchema } from '@/shared/validations/staff.validation';
import './ViewRestaurant.css';
export const ViewRestaurant = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // Staff management state
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showAddStaffForm, setShowAddStaffForm] = useState(false);
    const [staffFormData, setStaffFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
    });
    const [staffFormErrors, setStaffFormErrors] = useState({});
    useEffect(() => {
        if (id && token) {
            loadRestaurant();
            loadStaff();
            loadRoles();
        }
    }, [id, token]);
    const loadRestaurant = async () => {
        if (!id || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await RestaurantService.getRestaurant(token, id);
            if (response.success && response.data) {
                setRestaurant(response.data);
            }
            else {
                setError(response.message || 'Failed to load restaurant');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while loading the restaurant');
        }
        finally {
            setLoading(false);
        }
    };
    const loadStaff = async () => {
        if (!id || !token)
            return;
        setStaffLoading(true);
        try {
            const response = await StaffService.getStaffByRestaurant(token, id);
            if (response.success && response.data && Array.isArray(response.data.staff)) {
                setStaffList(response.data.staff);
            }
            else {
                setStaffList([]);
            }
        }
        catch (err) {
            console.error('Failed to load staff:', err.message);
            setStaffList([]);
        }
        finally {
            setStaffLoading(false);
        }
    };
    const loadRoles = async () => {
        if (!token)
            return;
        try {
            // In a real scenario, we'd fetch restaurant-specific roles or system roles
            // For now, let's assume there's a service to get roles
            // For the sake of fixing TS errors, I'll use a placeholder or check if service exists
            const response = await fetch(`/api/v1/roles?restaurantId=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRoles(data.data);
                if (data.data.length > 0 && !staffFormData.roleId) {
                    setStaffFormData(prev => ({ ...prev, roleId: data.data[0]._id }));
                }
            }
        }
        catch (err) {
            console.error('Failed to load roles');
        }
    };
    const handleAddStaff = async () => {
        if (!id || !token)
            return;
        // Validate form data - note: schema might need update but we'll try to map
        const validationData = {
            ...staffFormData,
            role: roles.find(r => r._id === staffFormData.roleId)?.name || 'waiter'
        };
        const result = createStaffSchema.safeParse(validationData);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0];
                fieldErrors[field] = err.message;
            });
            setStaffFormErrors(fieldErrors);
            return;
        }
        setStaffFormErrors({});
        setStaffLoading(true);
        try {
            const payload = {
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
                    roleId: roles[0]?._id || '',
                });
                loadStaff();
            }
            else {
                alert(response.message || 'Failed to add staff');
            }
        }
        catch (err) {
            alert(err.message || 'An error occurred while adding staff');
        }
        finally {
            setStaffLoading(false);
        }
    };
    const handleDeleteStaff = async (staffId, staffName) => {
        if (!token)
            return;
        if (!window.confirm(`Are you sure you want to delete "${staffName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const response = await StaffService.deleteStaff(token, staffId);
            if (response.success) {
                alert('Staff deleted successfully');
                loadStaff();
            }
            else {
                alert(response.message || 'Failed to delete staff');
            }
        }
        catch (err) {
            alert(err.message || 'An error occurred while deleting staff');
        }
    };
    const handleDelete = async () => {
        if (!id || !token || !restaurant)
            return;
        if (!window.confirm(`Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            const response = await RestaurantService.deleteRestaurant(token, id);
            if (response.success) {
                alert('Restaurant deleted successfully');
                navigate('/restaurants');
            }
            else {
                alert(response.message || 'Failed to delete restaurant');
            }
        }
        catch (err) {
            alert(err.message || 'An error occurred while deleting the restaurant');
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (loading) {
        return (_jsx("div", { className: "view-restaurant-container", children: _jsx("div", { className: "loading-state", children: "Loading restaurant details..." }) }));
    }
    if (error || !restaurant) {
        return (_jsx("div", { className: "view-restaurant-container", children: _jsxs("div", { className: "error-state", children: [_jsx("h2", { children: "Error" }), _jsx("p", { children: error || 'Restaurant not found' }), _jsx(Button, { onClick: () => navigate('/restaurants'), variant: "outline", children: "\u2190 Back to List" })] }) }));
    }
    return (_jsxs("div", { className: "view-restaurant-container", children: [_jsxs("div", { className: "view-restaurant-header", children: [_jsxs("div", { className: "header-info", children: [_jsx("h1", { className: "page-title", "data-testid": "restaurant-name", children: restaurant.name }), _jsxs("p", { className: "page-subtitle", children: ["/", restaurant.slug] }), _jsxs("div", { className: "status-badges", children: [_jsx("span", { className: `status-badge ${restaurant.isActive ? 'active' : 'inactive'}`, children: restaurant.isActive ? 'Active' : 'Inactive' }), _jsx("span", { className: "type-badge", children: restaurant.type === 'single' ? 'Single Location' : 'Chain' })] })] }), _jsxs("div", { className: "header-actions", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/restaurants'), children: "\u2190 Back to List" }), _jsx(Button, { variant: "primary", onClick: () => navigate(`/restaurants/${id}/edit`), children: "\u270F\uFE0F Edit Restaurant" }), _jsx(Button, { variant: "danger", onClick: handleDelete, children: "\uD83D\uDDD1\uFE0F Delete Restaurant" })] })] }), _jsxs("div", { className: "info-section", children: [_jsx("h2", { className: "section-title", children: "Owner Information" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Full Name" }), _jsx("p", { className: "info-value", "data-testid": "owner-name", children: restaurant.owner.name })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Email" }), _jsx("p", { className: "info-value", "data-testid": "owner-email", children: restaurant.owner.email })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Phone" }), _jsx("p", { className: "info-value", "data-testid": "owner-phone", children: restaurant.owner.phone || '—' })] })] })] }), _jsxs("div", { className: "info-section", children: [_jsx("h2", { className: "section-title", children: "Subscription Details" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Plan" }), _jsx("p", { className: "info-value", children: _jsx("span", { className: `plan-badge plan-${restaurant.subscription.plan}`, children: restaurant.subscription.plan.charAt(0).toUpperCase() +
                                                restaurant.subscription.plan.slice(1) }) })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Status" }), _jsx("p", { className: "info-value", children: _jsx("span", { className: `status-badge ${restaurant.subscription.isActive ? 'active' : 'inactive'}`, children: restaurant.subscription.isActive ? 'Active' : 'Expired/Inactive' }) })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Start Date" }), _jsx("p", { className: "info-value", children: formatDate(restaurant.subscription.startDate) })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "End Date" }), _jsx("p", { className: "info-value", children: formatDate(restaurant.subscription.endDate) })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Branches Used" }), _jsxs("p", { className: "info-value", children: [restaurant.subscription.currentBranches, " / ", restaurant.subscription.maxBranches] })] })] })] }), _jsxs("div", { className: "info-section", children: [_jsx("h2", { className: "section-title", children: "Theme Settings" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Primary Color" }), _jsxs("div", { className: "color-display", children: [_jsx("span", { className: "color-box", style: { backgroundColor: restaurant.theme.primaryColor } }), _jsx("p", { className: "info-value", children: restaurant.theme.primaryColor.toUpperCase() })] })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Secondary Color" }), _jsxs("div", { className: "color-display", children: [_jsx("span", { className: "color-box", style: { backgroundColor: restaurant.theme.secondaryColor } }), _jsx("p", { className: "info-value", children: restaurant.theme.secondaryColor.toUpperCase() })] })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Accent Color" }), _jsxs("div", { className: "color-display", children: [_jsx("span", { className: "color-box", style: { backgroundColor: restaurant.theme.accentColor } }), _jsx("p", { className: "info-value", children: restaurant.theme.accentColor.toUpperCase() })] })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Font Family" }), _jsx("p", { className: "info-value", style: { fontFamily: restaurant.theme.font }, children: restaurant.theme.font })] }), restaurant.theme.logo && (_jsxs("div", { className: "info-item full-width", children: [_jsx("label", { className: "info-label", children: "Logo" }), _jsx("div", { className: "theme-image-container", children: _jsx("img", { src: restaurant.theme.logo, alt: "Restaurant Logo", className: "theme-image logo" }) })] })), restaurant.theme.bannerImage && (_jsxs("div", { className: "info-item full-width", children: [_jsx("label", { className: "info-label", children: "Banner Image" }), _jsx("div", { className: "theme-image-container", children: _jsx("img", { src: restaurant.theme.bannerImage, alt: "Restaurant Banner", className: "theme-image banner" }) })] }))] })] }), _jsxs("div", { className: "info-section", children: [_jsx("h2", { className: "section-title", children: "Default Settings" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Currency" }), _jsx("p", { className: "info-value", children: restaurant.defaultSettings.currency })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Service Charge" }), _jsxs("p", { className: "info-value", children: [restaurant.defaultSettings.serviceChargePercentage, "%"] })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Allow Branch Override" }), _jsx("p", { className: "info-value", children: restaurant.defaultSettings.allowBranchOverride ? 'Yes' : 'No' })] })] })] }), _jsxs("div", { className: "info-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { className: "section-title", children: "Staff Management" }), _jsx(Button, { variant: "primary", onClick: () => setShowAddStaffForm(!showAddStaffForm), "data-testid": "add-staff-button", children: showAddStaffForm ? 'Cancel' : '+ Add Staff' })] }), showAddStaffForm && (_jsxs("div", { className: "add-staff-form", children: [_jsx("h3", { className: "form-subtitle", children: "Add New Staff Member" }), _jsxs("div", { className: "staff-form-grid", children: [_jsx(InputField, { label: "Full Name", type: "text", value: staffFormData.name, error: staffFormErrors.name, onChange: (e) => setStaffFormData({ ...staffFormData, name: e.target.value }), disabled: staffLoading, "data-testid": "staff-name-input" }), _jsx(InputField, { label: "Email", type: "email", value: staffFormData.email, error: staffFormErrors.email, onChange: (e) => setStaffFormData({ ...staffFormData, email: e.target.value }), disabled: staffLoading, "data-testid": "staff-email-input" }), _jsx(InputField, { label: "Phone", type: "tel", value: staffFormData.phone, error: staffFormErrors.phone, onChange: (e) => setStaffFormData({ ...staffFormData, phone: e.target.value }), disabled: staffLoading, "data-testid": "staff-phone-input" }), _jsx(InputField, { label: "Password", type: "password", value: staffFormData.password, error: staffFormErrors.password, onChange: (e) => setStaffFormData({ ...staffFormData, password: e.target.value }), disabled: staffLoading, "data-testid": "staff-password-input" }), _jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "Role" }), _jsx("select", { className: `role-select ${staffFormErrors.roleId ? 'error' : ''}`, value: staffFormData.roleId, onChange: (e) => setStaffFormData({
                                                    ...staffFormData,
                                                    roleId: e.target.value,
                                                }), disabled: staffLoading, "data-testid": "staff-role-select", children: roles.map(role => (_jsx("option", { value: role._id, children: role.displayName }, role._id))) }), staffFormErrors.roleId && (_jsx("span", { className: "error-message", children: staffFormErrors.roleId }))] })] }), _jsx("div", { className: "form-actions", children: _jsx(Button, { variant: "primary", onClick: handleAddStaff, loading: staffLoading, "data-testid": "submit-staff-button", children: "Add Staff" }) })] })), _jsx("div", { className: "staff-list", children: staffLoading && !showAddStaffForm ? (_jsx("div", { className: "loading-state", children: "Loading staff..." })) : staffList.length === 0 ? (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No staff members found. Add your first staff member above." }) })) : (_jsx("div", { className: "staff-table-container", children: _jsxs("table", { className: "staff-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: staffList.map((staff) => (_jsxs("tr", { "data-testid": `staff-row-${staff._id}`, children: [_jsx("td", { "data-testid": "staff-name", children: staff.name }), _jsx("td", { "data-testid": "staff-email", children: staff.email }), _jsx("td", { children: staff.phone || '—' }), _jsx("td", { children: _jsx("span", { className: "role-badge", children: (staff.role || '')
                                                            .replace('_', ' ')
                                                            .replace(/\b\w/g, (l) => l.toUpperCase()) }) }), _jsx("td", { children: _jsx("span", { className: `status-badge ${staff.isActive ? 'active' : 'inactive'}`, children: staff.isActive ? 'Active' : 'Inactive' }) }), _jsx("td", { children: _jsx(Button, { variant: "danger", onClick: () => handleDeleteStaff(staff._id, staff.name), "data-testid": `delete-staff-${staff._id}`, children: "Delete" }) })] }, staff._id))) })] }) })) })] }), _jsxs("div", { className: "info-section", children: [_jsx("h2", { className: "section-title", children: "Metadata" }), _jsxs("div", { className: "info-grid", children: [_jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Restaurant ID" }), _jsx("p", { className: "info-value mono", children: restaurant._id })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Created At" }), _jsx("p", { className: "info-value", children: formatDate(restaurant.createdAt) })] }), _jsxs("div", { className: "info-item", children: [_jsx("label", { className: "info-label", children: "Last Updated" }), _jsx("p", { className: "info-value", children: formatDate(restaurant.updatedAt) })] })] })] })] }));
};
