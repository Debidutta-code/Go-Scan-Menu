import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/staff/pages/EditStaff.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { ArrowLeft } from 'lucide-react';
import './EditStaff.css';
export const EditStaff = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useStaffAuth();
    const [staff, setStaff] = useState(null);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        roleId: '',
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [serverError, setServerError] = useState(null);
    useEffect(() => {
        if (id && token) {
            fetchData();
        }
    }, [id, token]);
    const fetchData = async () => {
        if (!token || !id)
            return;
        try {
            setFetchLoading(true);
            const [staffResponse, rolesResponse] = await Promise.all([
                StaffService.getStaff(token, id),
                fetch(`/api/v1/roles`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
            ]);
            const staffData = staffResponse.data;
            if (!staffData) {
                setServerError('Staff member not found');
                return;
            }
            if (rolesResponse.success) {
                setRoles(rolesResponse.data);
            }
            setStaff(staffData);
            setFormData({
                name: staffData.name,
                email: staffData.email,
                phone: staffData.phone,
                roleId: staffData.roleId,
                isActive: staffData.isActive,
            });
        }
        catch (err) {
            setServerError(err.message || 'Failed to fetch details');
        }
        finally {
            setFetchLoading(false);
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone is required';
        }
        if (!formData.roleId) {
            newErrors.roleId = 'Role is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);
        if (!validateForm() || !token || !id)
            return;
        try {
            setLoading(true);
            await StaffService.updateStaff(token, id, {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                roleId: formData.roleId,
                isActive: formData.isActive,
            });
            navigate('/staff/team');
        }
        catch (err) {
            setServerError(err.message || 'Failed to update staff member');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };
    if (fetchLoading) {
        return (_jsx("div", { className: "edit-staff-container", children: _jsx("div", { className: "loading-state", children: "Loading staff details..." }) }));
    }
    if (!staff) {
        return (_jsx("div", { className: "edit-staff-container", children: _jsx("div", { className: "error-state", children: "Staff member not found" }) }));
    }
    return (_jsxs("div", { className: "edit-staff-container", "data-testid": "edit-staff-page", children: [_jsx("div", { className: "edit-staff-header", children: _jsxs("button", { className: "back-button", onClick: () => navigate('/staff/team'), "data-testid": "back-button", children: [_jsx(ArrowLeft, { size: 20 }), "Back to Team"] }) }), _jsxs("div", { className: "edit-staff-card", children: [_jsxs("div", { className: "edit-staff-card-header", children: [_jsx("h1", { className: "edit-staff-title", children: "Edit Staff Member" }), _jsx("p", { className: "edit-staff-subtitle", children: "Update staff information and role" })] }), serverError && (_jsx("div", { className: "error-banner", "data-testid": "error-message", children: serverError })), _jsxs("form", { onSubmit: handleSubmit, className: "edit-staff-form", children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Personal Information" }), _jsx(InputField, { label: "Full Name", type: "text", value: formData.name, error: errors.name, onChange: (e) => handleChange('name', e.target.value), disabled: loading, "data-testid": "name-input" }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Email Address", type: "email", value: formData.email, error: errors.email, onChange: (e) => handleChange('email', e.target.value), disabled: loading, "data-testid": "email-input" }), _jsx(InputField, { label: "Phone Number", type: "tel", value: formData.phone, error: errors.phone, onChange: (e) => handleChange('phone', e.target.value), disabled: loading, "data-testid": "phone-input" })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Role & Status" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "roleId", className: "form-label", children: "Staff Role" }), _jsx("select", { id: "roleId", value: formData.roleId, onChange: (e) => handleChange('roleId', e.target.value), className: "form-select", disabled: loading, "data-testid": "staff-type-select", children: roles.map(option => (_jsx("option", { value: option._id, children: option.displayName }, option._id))) }), _jsx("p", { className: "form-helper-text", children: "Role permissions are configured in the Permissions tab" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "isActive", className: "form-label", children: "Account Status" }), _jsxs("select", { id: "isActive", value: formData.isActive ? 'active' : 'inactive', onChange: (e) => handleChange('isActive', e.target.value === 'active'), className: "form-select", disabled: loading, "data-testid": "status-select", children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }), _jsx("p", { className: "form-helper-text", children: "Inactive accounts cannot log in" })] })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/staff/team'), disabled: loading, "data-testid": "cancel-button", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, disabled: loading, "data-testid": "submit-button", children: "Save Changes" })] })] })] })] }));
};
