import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button, Input, Card } from '@/components/common';
import './Login.css';
const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        console.log('Submitting login form with:', { email, password });
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            // Store token and user info
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.staff._id));

            console.log('Login successful:', response);
            // Redirect based on role
            navigate('/admin/dashboard');
        }
        catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "login-page", children: _jsx("div", { className: "login-container", children: _jsxs(Card, { className: "login-card", children: [_jsxs("div", { className: "login-header", children: [_jsx("h1", { className: "login-title", children: "\uD83C\uDF74 Restaurant QR Menu" }), _jsx("p", { className: "login-subtitle", children: "Sign in to your account" })] }), error && (_jsx("div", { className: "error-message", children: _jsxs("span", { children: ["\u26A0\uFE0F ", error] }) })), _jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [_jsx(Input, { label: "Email Address", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Enter your email", required: true }), _jsx(Input, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: loading, disabled: loading, children: loading ? 'Signing in...' : 'Sign In' })] }), _jsx("div", { className: "login-footer", children: _jsxs("p", { children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "register-link", children: "Register here" })] }) })] }) }) }));
};
export default Login;
