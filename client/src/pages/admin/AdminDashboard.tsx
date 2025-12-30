import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import './AdminDashboard.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    activeTables: 0,
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats for now
      setStats({
        todayOrders: 45,
        activeOrders: 12,
        totalRevenue: 15420,
        activeTables: 8,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <Navbar
        title="Dashboard"
        actions={
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        }
      />

      <div className="dashboard-container container">
        {/* Stats Grid */}
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Today's Orders</p>
              <h2 className="stat-value">{stats.todayOrders}</h2>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <p className="stat-label">Active Orders</p>
              <h2 className="stat-value">{stats.activeOrders}</h2>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Revenue</p>
              <h2 className="stat-value">₹{stats.totalRevenue}</h2>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-icon">🪑</div>
            <div className="stat-content">
              <p className="stat-label">Active Tables</p>
              <h2 className="stat-value">{stats.activeTables}</h2>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Card className="action-card" onClick={() => navigate('/admin/orders')} hoverable>
              <div className="action-icon">📋</div>
              <h3>Manage Orders</h3>
              <p>View and manage all orders</p>
            </Card>

            <Card className="action-card" onClick={() => navigate('/admin/kitchen')} hoverable>
              <div className="action-icon">👨‍🍳</div>
              <h3>Kitchen Display</h3>
              <p>Real-time kitchen orders</p>
            </Card>

            <Card className="action-card" onClick={() => navigate('/admin/menu')} hoverable>
              <div className="action-icon">🍴</div>
              <h3>Menu Management</h3>
              <p>Edit menu items</p>
            </Card>

            <Card className="action-card" onClick={() => navigate('/admin/tables')} hoverable>
              <div className="action-icon">📦</div>
              <h3>Table Management</h3>
              <p>Manage tables & QR codes</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
