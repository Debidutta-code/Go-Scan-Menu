// src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { loginSchema } from '../../validations/auth.validation';
import './Login.css';
import { ILLUSTRATION_URL } from '@/const/auth/auth';
import Illustrator from './Illustrator';

export const LoginPage: React.FC<{}> = () => {
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // 🔍 Zod validation
        const result = loginSchema.safeParse({ email, password });

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
            await login(email, password);
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
        <div className="login-split-container">
            {/* Left side: Illustration */}
            <Illustrator />
            {/* Right side: Login form */}
            <div className="login-form-side">
                <div className="login-page-card">
                    <div className="login-page-header">
                        <h1 className="login-page-title">GoScanMenu</h1>
                        <p className="login-page-subtitle">SuperAdmin Portal</p>
                    </div>

                    <div className="login-page-form">
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
                        />

                        <Button
                            variant="primary"
                            onClick={handleLogin}
                            loading={loading}
                            fullWidth
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
