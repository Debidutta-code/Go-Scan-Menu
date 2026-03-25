import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { StaffService } from '@/modules/staff/services/staff.service';
const ChangePasswordForm = ({ token }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChanging, setIsChanging] = useState(false);
    const [message, setMessage] = useState(null);
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setIsChanging(true);
        setMessage(null);
        try {
            await StaffService.changePassword(token, currentPassword, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update password' });
        }
        finally {
            setIsChanging(false);
        }
    };
    return (_jsxs("form", { className: "change-password-form", onSubmit: handleChangePassword, children: [_jsx("p", { className: "form-description", children: "Update your password to keep your account secure." }), message && (_jsxs("div", { className: `form-feedback ${message.type}`, children: [message.type === 'success' ? _jsx(CheckCircle, { size: 16 }) : _jsx(AlertCircle, { size: 16 }), message.text] })), _jsxs("div", { className: "settings-form-group", children: [_jsx("label", { className: "form-label", children: "Current Password" }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Lock, { size: 16, className: "field-icon" }), _jsx("input", { type: "password", className: "settings-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), required: true })] })] }), _jsxs("div", { className: "settings-form-row", children: [_jsxs("div", { className: "settings-form-group", children: [_jsx("label", { className: "form-label", children: "New Password" }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Lock, { size: 16, className: "field-icon" }), _jsx("input", { type: "password", className: "settings-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: newPassword, onChange: (e) => setNewPassword(e.target.value), required: true })] })] }), _jsxs("div", { className: "settings-form-group", children: [_jsx("label", { className: "form-label", children: "Confirm New Password" }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Lock, { size: 16, className: "field-icon" }), _jsx("input", { type: "password", className: "settings-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })] })] })] }), _jsx("button", { type: "submit", className: "settings-submit-btn", disabled: isChanging, children: isChanging ? 'Updating...' : 'Update Password' })] }));
};
export default ChangePasswordForm;
