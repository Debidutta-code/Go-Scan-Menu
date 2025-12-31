// src/pages/auth/Login.tsx (updated)
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import './Login.css';

interface LoginPageProps {
    onShowRegister: () => void;
}

const ILLUSTRATION_URL = 'https://res.cloudinary.com/da5p8dzn3/image/upload/v1767174798/Gemini_Generated_Image_dvzvchdvzvchdvzv_d1mmkk.png';

export const LoginPage: React.FC<LoginPageProps> = ({ onShowRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Unable to sign in');
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
            <div className="login-illustration-side">
                <img
                    src={ILLUSTRATION_URL}
                    alt="Customer scanning QR code menu on phone with waiter"
                    className="login-illustration"
                />
            </div>

            {/* Right side: Login form */}
            <div className="login-form-side">
                <div className="login-page-card">
                    <div className="login-page-header">
                        <h1 className="login-page-title">GoScanMenu</h1>
                        <p className="login-page-subtitle">SuperAdmin Portal</p>
                    </div>

                    <div className="login-page-form">
                        {error && (
                            <div className="login-page-error-message" role="alert">
                                {error}
                            </div>
                        )}

                        <InputField
                            label="Email"
                            type="email"
                            value={email}
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

                        {/* Optional: divider + create account link */}
                        {/* <div className="login-page-divider">
                            <span className="login-page-divider-text">or</span>
                        </div>
                        <Button variant="outline" fullWidth onClick={onShowRegister}>
                            Create an account
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};