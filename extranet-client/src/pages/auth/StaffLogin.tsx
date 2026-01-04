// src/pages/auth/StaffLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { staffLoginSchema } from '../../validations/staff.validation';
import './StaffLogin.css';
import { ILLUSTRATION_URL } from '@/const/auth/auth';
import Illustrator from './Illustrator';

export const StaffLoginPage: React.FC<{}> = () => {
    const navigate = useNavigate();
    const { login } = useStaffAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>('');

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        role?: string;
    }>({});

    const [loading, setLoading] = useState(false);

    const roleOptions = [
        { value: 'owner', label: 'Owner' },
        { value: 'branch_manager', label: 'Branch Manager' },
        { value: 'manager', label: 'Manager' },
        { value: 'waiter', label: 'Waiter' },
        { value: 'kitchen_staff', label: 'Kitchen Staff' },
        { value: 'cashier', label: 'Cashier' },
    ];

    const handleLogin = async () => {
        // 🔍 Zod validation
        const result = staffLoginSchema.safeParse({ email, password, role });

        if (!result.success) {
            const fieldErrors: typeof errors = {};

            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof typeof errors;
                fieldErrors[field] = err.message;
            });

            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await login(email, password, role);
            // Redirect to staff dashboard
            navigate('/staff/dashboard');
        } catch (err: any) {
            setErrors({
                password: err.message || 'Invalid credentials',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleLogin();
        }
    };

    return (
        <div className="staff-login-split-container">
            {/* Left side: Illustration */}
            <Illustrator />
            {/* Right side: Login form */}
            <div className="staff-login-form-side">
                <div className="staff-login-page-card">
                    <div className="staff-login-page-header">
                        <h1 className="staff-login-page-title">GoScanMenu</h1>
                        <p className="staff-login-page-subtitle">Staff Portal</p>
                    </div>

                    <div className="staff-login-page-form">
                        {/* Role Selector */}
                        <div className="input-group">
                            <label className="input-label">Role</label>
                            <select
                                className={`role-select ${errors.role ? 'error' : ''}`}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                disabled={loading}
                                data-testid="staff-role-select"
                            >
                                <option value="">Select your role</option>
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.role && (
                                <span className="error-message">{errors.role}</span>
                            )}
                        </div>

                        <InputField
                            label="Email"
                            type="email"
                            value={email}
                            error={errors.email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            autoComplete="email"
                            autoFocus
                            data-testid="staff-email-input"
                        />

                        <InputField
                            label="Password"
                            type="password"
                            value={password}
                            error={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                            autoComplete="current-password"
                            data-testid="staff-password-input"
                        />

                        <Button
                            variant="primary"
                            onClick={handleLogin}
                            loading={loading}
                            fullWidth
                            data-testid="staff-login-button"
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
