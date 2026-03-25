import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/staff/pages/StaffList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { StaffRole } from '@/shared/types/staffPermissions.types';
import { Button } from '@/shared/components/Button';
import { PermissionsModal } from '@/modules/staff/components/PermissionsModal';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import './StaffList.css';
const STAFF_ROLE_LABELS = {
    [StaffRole.SUPER_ADMIN]: 'Super Admin',
    [StaffRole.OWNER]: 'Owner',
    [StaffRole.BRANCH_MANAGER]: 'Branch Manager',
    [StaffRole.MANAGER]: 'Manager',
    [StaffRole.WAITER]: 'Waiter',
    [StaffRole.KITCHEN_STAFF]: 'Kitchen Staff',
    [StaffRole.CASHIER]: 'Cashier',
};
export const StaffList = () => {
    const navigate = useNavigate();
    const { token, staff: currentStaff } = useStaffAuth();
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [error, setError] = useState(null);
    // Permissions modal state
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [selectedStaffRole, setSelectedStaffRole] = useState(null);
    useEffect(() => {
        fetchStaff();
    }, []);
    const fetchStaff = async () => {
        if (!token || !currentStaff?.restaurantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const response = await StaffService.getStaffByRestaurant(token, currentStaff.restaurantId, 1, 100);
            if (response.data && response.data.staff) {
                setStaffList(response.data.staff);
            }
            else {
                setStaffList([]);
            }
        }
        catch (err) {
            setError(err?.message || 'Failed to fetch staff');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (staffId) => {
        if (!token)
            return;
        if (!confirm('Are you sure you want to delete this staff member?'))
            return;
        try {
            await StaffService.deleteStaff(token, staffId);
            fetchStaff();
        }
        catch (err) {
            alert(err.message || 'Failed to delete staff');
        }
    };
    const handleManagePermissions = (role) => {
        setSelectedStaffRole(role);
        setIsPermissionsModalOpen(true);
    };
    const handlePermissionsSaved = () => {
        alert('Permissions updated successfully!');
    };
    const filteredStaff = staffList.filter((staff) => {
        const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.phone.includes(searchQuery);
        const matchesRole = filterRole === 'all' || staff.role === filterRole;
        return matchesSearch && matchesRole;
    });
    if (loading) {
        return (_jsx("div", { className: "staff-list-container", children: _jsx("div", { className: "loading-state", children: "Loading staff..." }) }));
    }
    return (_jsxs("div", { className: "staff-list-container", "data-testid": "staff-list-page", children: [_jsxs("div", { className: "staff-list-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "staff-list-title", children: "Team Management" }), _jsx("p", { className: "staff-list-subtitle", children: "Manage your restaurant staff members" })] }), _jsxs(Button, { variant: "primary", onClick: () => navigate('/staff/team/add'), "data-testid": "add-staff-button", children: [_jsx(Plus, { size: 18 }), "Add Staff Member"] })] }), error && (_jsx("div", { className: "error-banner", "data-testid": "error-message", children: error })), _jsxs("div", { className: "staff-list-filters", children: [_jsxs("div", { className: "search-box", children: [_jsx(Search, { size: 18, className: "search-icon" }), _jsx("input", { type: "text", placeholder: "Search by name, email, or phone...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input", "data-testid": "search-input" })] }), _jsxs("select", { value: filterRole, onChange: (e) => setFilterRole(e.target.value), className: "role-filter", "data-testid": "role-filter", children: [_jsx("option", { value: "all", children: "All Roles" }), Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (_jsx("option", { value: value, children: label }, value)))] })] }), filteredStaff.length === 0 ? (_jsxs("div", { className: "empty-state", "data-testid": "empty-state", children: [_jsx("p", { children: "No staff members found" }), _jsx(Button, { variant: "outline", onClick: () => navigate('/staff/team/add'), children: "Add Your First Staff Member" })] })) : (_jsx("div", { className: "staff-table-container", children: _jsxs("table", { className: "staff-table", "data-testid": "staff-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: filteredStaff.map((staff) => (_jsxs("tr", { "data-testid": `staff-row-${staff._id}`, children: [_jsx("td", { className: "staff-name", children: staff.name }), _jsx("td", { className: "staff-email", children: staff.email }), _jsx("td", { className: "staff-phone", children: staff.phone }), _jsx("td", { children: _jsx("span", { className: "role-badge", "data-testid": `role-badge-${staff.role}`, children: STAFF_ROLE_LABELS[staff.role] }) }), _jsx("td", { children: _jsx("span", { className: `status-badge ${staff.isActive ? 'active' : 'inactive'}`, "data-testid": `status-${staff._id}`, children: staff.isActive ? 'Active' : 'Inactive' }) }), _jsxs("td", { className: "action-buttons", children: [_jsx("button", { className: "icon-button permissions", onClick: () => handleManagePermissions(staff.role), title: "Manage Permissions", "data-testid": `permissions-button-${staff._id}`, children: _jsx(Shield, { size: 16 }) }), _jsx("button", { className: "icon-button edit", onClick: () => navigate(`/staff/team/edit/${staff._id}`), title: "Edit", "data-testid": `edit-button-${staff._id}`, children: _jsx(Edit, { size: 16 }) }), _jsx("button", { className: "icon-button delete", onClick: () => handleDelete(staff._id), title: "Delete", "data-testid": `delete-button-${staff._id}`, children: _jsx(Trash2, { size: 16 }) })] })] }, staff._id))) })] }) })), _jsxs("div", { className: "staff-count", "data-testid": "staff-count", children: ["Showing ", filteredStaff.length, " of ", staffList.length, " staff members"] }), selectedStaffRole && currentStaff && (_jsx(PermissionsModal, { isOpen: isPermissionsModalOpen, onClose: () => setIsPermissionsModalOpen(false), restaurantId: currentStaff.restaurantId, staffRole: selectedStaffRole, token: token || '', onSave: handlePermissionsSaved }))] }));
};
