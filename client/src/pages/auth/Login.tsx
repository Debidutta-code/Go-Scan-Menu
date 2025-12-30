import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import './Login.css';
import { Button, Card, Input } from '@/components/common';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/staff/login', {
        email,
        password,
      });

      const { token, staff } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(staff));

      // Navigate based on role
      if (staff.role === 'admin' || staff.role === 'owner') {
        navigate('/admin/dashboard');
      } else {
        navigate('/admin/orders');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <h1 className="login-title">🍴 QR Restaurant</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <div className="login-error">{error}</div>}

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <p>Demo credentials:</p>
            <p className="demo-text">Email: admin@restaurant.com</p>
            <p className="demo-text">Password: admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
