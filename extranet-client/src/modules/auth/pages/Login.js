import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/auth/Login.tsx
import { useState } from 'react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { loginSchema } from '@/shared/validations/auth.validation';
import './Login.css';
import Illustrator from './Illustrator';
export const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        // 🔍 Zod validation
        const result = loginSchema.safeParse({ email, password });
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
    return (_jsxs("div", { className: "login-split-container", children: [_jsx(Illustrator, {}), _jsx("div", { className: "login-form-side", children: _jsxs("div", { className: "login-page-card", children: [_jsxs("div", { className: "login-page-header", children: [_jsx("h1", { className: "login-page-title", children: "GoScanMenu" }), _jsx("p", { className: "login-page-subtitle", children: "SuperAdmin Portal" })] }), _jsxs("div", { className: "login-page-form", children: [_jsx(InputField, { label: "Email", type: "email", value: email, error: errors.email, onChange: (e) => setEmail(e.target.value), onKeyPress: handleKeyPress, disabled: loading, autoComplete: "email", autoFocus: true }), _jsx(InputField, { label: "Password", type: "password", value: password, error: errors.password, onChange: (e) => setPassword(e.target.value), onKeyPress: handleKeyPress, disabled: loading, autoComplete: "current-password" }), _jsx(Button, { variant: "primary", onClick: handleLogin, loading: loading, fullWidth: true, children: "Sign In" })] })] }) })] }));
};
