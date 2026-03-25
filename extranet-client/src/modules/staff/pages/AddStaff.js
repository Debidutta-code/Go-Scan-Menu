import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// extranet-client/src/modules/staff/pages/AddStaff.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { StaffService } from '@/modules/staff/services/staff.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { ArrowLeft } from 'lucide-react';
import './AddStaff.css';
export const AddStaff = () => {
    const navigate = useNavigate();
    const { token, staff: currentStaff } = useStaffAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        roleId: '',
        branchId: '',
    });
    const [roles, setRoles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState(null);
    useEffect(() => {
        const fetchRoles = async () => {
            if (!token)
                return;
            try {
                const response = await fetch(`/api/v1/roles?restaurantId=${currentStaff?.restaurantId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setRoles(data.data);
                    if (data.data.length > 0) {
                        setFormData(prev => ({ ...prev, roleId: data.data[0]._id }));
                    }
                }
            }
            catch (err) {
                console.error('Failed to fetch roles');
            }
        };
        fetchRoles();
    }, [token, currentStaff?.restaurantId]);
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
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
        if (!validateForm() || !token || !currentStaff?.restaurantId)
            return;
        try {
            setLoading(true);
            await StaffService.createStaff(token, {
                restaurantId: currentStaff.restaurantId,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
                roleId: formData.roleId,
                branchId: formData.branchId || undefined,
            });
            navigate('/staff/team');
        }
        catch (err) {
            setServerError(err.message || 'Failed to create staff member');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };
    return (_jsxs("div", { className: "add-staff-container", "data-testid": "add-staff-page", children: [_jsx("div", { className: "add-staff-header", children: _jsxs("button", { className: "back-button", onClick: () => navigate('/staff/team'), "data-testid": "back-button", children: [_jsx(ArrowLeft, { size: 20 }), "Back to Team"] }) }), _jsxs("div", { className: "add-staff-card", children: [_jsxs("div", { className: "add-staff-card-header", children: [_jsx("h1", { className: "add-staff-title", children: "Add New Staff Member" }), _jsx("p", { className: "add-staff-subtitle", children: "Create a new staff account with assigned role" })] }), serverError && (_jsx("div", { className: "error-banner", "data-testid": "error-message", children: serverError })), _jsxs("form", { onSubmit: handleSubmit, className: "add-staff-form", children: [_jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Personal Information" }), _jsx(InputField, { label: "Full Name", type: "text", value: formData.name, error: errors.name, onChange: (e) => handleChange('name', e.target.value), disabled: loading, "data-testid": "name-input" }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Email Address", type: "email", value: formData.email, error: errors.email, onChange: (e) => handleChange('email', e.target.value), disabled: loading, "data-testid": "email-input" }), _jsx(InputField, { label: "Phone Number", type: "tel", value: formData.phone, error: errors.phone, onChange: (e) => handleChange('phone', e.target.value), disabled: loading, "data-testid": "phone-input" })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Account Security" }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Password", type: "password", value: formData.password, error: errors.password, onChange: (e) => handleChange('password', e.target.value), disabled: loading, "data-testid": "password-input" }), _jsx(InputField, { label: "Confirm Password", type: "password", value: formData.confirmPassword, error: errors.confirmPassword, onChange: (e) => handleChange('confirmPassword', e.target.value), disabled: loading, "data-testid": "confirm-password-input" })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Role & Access" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "roleId", className: "form-label", children: "Staff Role" }), _jsx("select", { id: "roleId", value: formData.roleId, onChange: (e) => handleChange('roleId', e.target.value), className: "form-select", disabled: loading, "data-testid": "staff-type-select", children: roles.map((role) => (_jsx("option", { value: role._id, children: role.displayName }, role._id))) }), _jsx("p", { className: "form-helper-text", children: "Role permissions can be configured in the Permissions tab" }), errors.roleId && _jsx("p", { className: "error-message", children: errors.roleId })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/staff/team'), disabled: loading, "data-testid": "cancel-button", children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, disabled: loading, "data-testid": "submit-button", children: "Create Staff Member" })] })] })] })] }));
};
