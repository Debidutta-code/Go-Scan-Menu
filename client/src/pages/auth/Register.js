import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Button, Input, Card } from '@/components/common';
import './Register.css';
const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        restaurantId: '',
        branchId: '',
        role: 'waiter',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await authService.register(registerData);
            // Store token and user info
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Redirect to dashboard
            navigate('/admin/dashboard');
        }
        catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "register-page", children: _jsx("div", { className: "register-container", children: _jsxs(Card, { className: "register-card", children: [_jsxs("div", { className: "register-header", children: [_jsx("h1", { className: "register-title", children: "\uD83C\uDF74 Restaurant QR Menu" }), _jsx("p", { className: "register-subtitle", children: "Create a new account" })] }), error && (_jsx("div", { className: "error-message", children: _jsxs("span", { children: ["\u26A0\uFE0F ", error] }) })), _jsxs("form", { onSubmit: handleSubmit, className: "register-form", children: [_jsx(Input, { label: "Full Name", name: "name", value: formData.name, onChange: handleChange, placeholder: "Enter your full name", required: true }), _jsx(Input, { label: "Email Address", name: "email", type: "email", value: formData.email, onChange: handleChange, placeholder: "Enter your email", required: true }), _jsx(Input, { label: "Phone Number", name: "phone", type: "tel", value: formData.phone, onChange: handleChange, placeholder: "Enter your phone number", required: true }), _jsx(Input, { label: "Restaurant ID", name: "restaurantId", value: formData.restaurantId, onChange: handleChange, placeholder: "Enter restaurant ID", required: true }), _jsx(Input, { label: "Branch ID (Optional)", name: "branchId", value: formData.branchId, onChange: handleChange, placeholder: "Enter branch ID if applicable" }), _jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "Role" }), _jsxs("select", { name: "role", value: formData.role, onChange: handleChange, className: "input", required: true, children: [_jsx("option", { value: "waiter", children: "Waiter" }), _jsx("option", { value: "chef", children: "Chef" }), _jsx("option", { value: "manager", children: "Manager" }), _jsx("option", { value: "cashier", children: "Cashier" })] })] }), _jsx(Input, { label: "Password", name: "password", type: "password", value: formData.password, onChange: handleChange, placeholder: "Create a password", required: true }), _jsx(Input, { label: "Confirm Password", name: "confirmPassword", type: "password", value: formData.confirmPassword, onChange: handleChange, placeholder: "Confirm your password", required: true }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", loading: loading, disabled: loading, children: loading ? 'Creating Account...' : 'Create Account' })] }), _jsx("div", { className: "register-footer", children: _jsxs("p", { children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "login-link", children: "Sign in here" })] }) })] }) }) }));
};
export default Register;
