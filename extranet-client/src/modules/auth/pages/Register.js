import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/auth/Register.tsx
import { useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './Register.css';
export const RegisterPage = () => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !loading) {
            handleRegister();
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsxs("div", { className: "auth-header", children: [_jsx("h1", { className: "auth-title", children: "GoScanMenu" }), _jsx("p", { className: "auth-subtitle", children: "Create SuperAdmin Account" })] }), _jsxs("div", { className: "form-container", children: [error && _jsx("div", { className: "error-alert", children: error }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), onKeyPress: handleKeyPress, className: "form-input", placeholder: "John Doe", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email Address" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), onKeyPress: handleKeyPress, className: "form-input", placeholder: "admin@example.com", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), onKeyPress: handleKeyPress, className: "form-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: loading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Confirm Password" }), _jsx("input", { type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), onKeyPress: handleKeyPress, className: "form-input", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", disabled: loading })] }), _jsx("button", { onClick: handleRegister, className: "btn-primary", disabled: loading, children: loading ? 'Creating Account...' : 'Create Account' }), _jsx("button", { className: "btn-secondary", disabled: loading, children: "Back to Login" })] })] }) }));
};
