import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { staffLoginSchema } from '@/shared/validations/staff.validation';
import './StaffLogin.css';
import Illustrator from './Illustrator';
export const StaffLoginPage = () => {
    const navigate = useNavigate();
    const { login } = useStaffAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    /* ===================== HANDLERS ===================== */
    const handleLogin = async () => {
        // Validate input
        const result = staffLoginSchema.safeParse({ email, password });
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0];
                fieldErrors[field] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            await login(email, password);
            navigate('/staff/dashboard');
        }
        catch (err) {
            setErrors({
                password: err.message || 'Invalid credentials',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin();
        }
    };
    /* ===================== UI ===================== */
    return (_jsxs("div", { className: "staff-login-split-container", children: [_jsx(Illustrator, {}), _jsx("div", { className: "staff-login-form-side", children: _jsxs("div", { className: "staff-login-page-card", children: [_jsxs("div", { className: "staff-login-page-header", children: [_jsx("h1", { className: "staff-login-page-title", children: "TheScanMenu" }), _jsx("p", { className: "staff-login-page-subtitle", children: "Staff Portal" })] }), _jsxs("div", { className: "staff-login-page-form", children: [_jsx(InputField, { label: "Email", type: "email", value: email, error: errors.email, onChange: (e) => setEmail(e.target.value), onKeyPress: handleKeyPress, disabled: loading, autoComplete: "email", autoFocus: true, "data-testid": "staff-email-input" }), _jsx(InputField, { label: "Password", type: "password", value: password, error: errors.password, onChange: (e) => setPassword(e.target.value), onKeyPress: handleKeyPress, disabled: loading, autoComplete: "current-password", "data-testid": "staff-password-input" }), _jsx(Button, { variant: "primary", onClick: handleLogin, loading: loading, fullWidth: true, "data-testid": "staff-login-button", children: "Sign In" })] })] }) })] }));
};
