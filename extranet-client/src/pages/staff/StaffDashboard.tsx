// src/pages/staff/StaffDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Menu as MenuIcon,
  Settings,
  Table as TableIcon,
  Lock,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import './StaffDashboard.css';

const DUMMY_STATS = [
  { label: 'Today\'s Orders', value: '24', trend: '+12%', trendUp: true, icon: ShoppingBag },
  { label: 'Today\'s Revenue', value: '$1,250', trend: '+8.5%', trendUp: true, icon: DollarSign },
  { label: 'Avg. Order Value', value: '$52.10', trend: '-2%', trendUp: false, icon: TrendingUp },
  { label: 'Active Customers', value: '18', trend: '+4', trendUp: true, icon: Users },
];

const DUMMY_ORDERS = [
  { id: '#ORD-7291', customer: 'John Doe', items: 3, total: '$45.00', status: 'completed', time: '10 mins ago' },
  { id: '#ORD-7290', customer: 'Sarah Smith', items: 1, total: '$12.50', status: 'pending', time: '15 mins ago' },
  { id: '#ORD-7289', customer: 'Michael Chen', items: 5, total: '$89.00', status: 'completed', time: '25 mins ago' },
  { id: '#ORD-7288', customer: 'Emma Wilson', items: 2, total: '$34.00', status: 'cancelled', time: '45 mins ago' },
  { id: '#ORD-7287', customer: 'James Brown', items: 4, total: '$62.00', status: 'completed', time: '1 hour ago' },
];

const POPULAR_ITEMS = [
  { rank: 1, name: 'Margherita Pizza', category: 'Main Course', sales: 42 },
  { rank: 2, name: 'Truffle Pasta', category: 'Main Course', sales: 38 },
  { rank: 3, name: 'Caesar Salad', category: 'Starters', sales: 31 },
  { rank: 4, name: 'Iced Caramel Latte', category: 'Beverages', sales: 28 },
  { rank: 5, name: 'Chocolate Lava Cake', category: 'Desserts', sales: 25 },
];

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { staff } = useStaffAuth();

  if (!staff) {
    return (
      <div className="staff-dashboard-layout">
        <div className="loading-state">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-layout">
      {/* Page Actions Toolbar */}
      <div className="dashboard-page-toolbar">
        <div className="toolbar-left">
          <h1 className="dashboard-page-title">Dashboard Overview</h1>
          <p className="stat-label">Welcome back, {staff.name}</p>
        </div>

        <div className="dashboard-toolbar-actions">
          <span className="status-badge active">System Live</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">

        {/* Stats Row */}
        <div className="stats-grid">
          {DUMMY_STATS.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
                {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.trend} <span style={{ color: '#9ca3af', fontWeight: 400 }}>vs yesterday</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Center Grid */}
        <div className="dashboard-interactive-grid">

          {/* Recent Orders Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Recent Orders</h3>
              <button className="select-all-button">View All</button>
            </div>
            <div className="panel-content">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {DUMMY_ORDERS.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 600 }}>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.total}</td>
                      <td>
                        <span className={`status-pill ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280' }}>{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Popular Items Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Most Popular</h3>
              <button className="select-all-button">Full Report</button>
            </div>
            <div className="panel-content popular-list">
              {POPULAR_ITEMS.map(item => (
                <div key={item.rank} className="popular-item">
                  <div className="popular-item-info">
                    <span className="item-rank">#{item.rank}</span>
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-sales">{item.category}</div>
                    </div>
                  </div>
                  <div className="item-sales" style={{ fontWeight: 600 }}>
                    {item.sales} sold
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Actions Row */}
        <div className="quick-actions-section">
          <h3 className="panel-title" style={{ marginBottom: '16px' }}>System Management</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-button" onClick={() => navigate('/staff/menu')}>
              <div className="action-icon-circle"><MenuIcon size={20} /></div>
              <span className="action-label">Menu Management</span>
            </div>

            <div className="quick-action-button" onClick={() => navigate('/staff/tables')}>
              <div className="action-icon-circle"><TableIcon size={20} /></div>
              <span className="action-label">Table / QR</span>
            </div>

            <div className="quick-action-button" onClick={() => navigate('/staff/team')}>
              <div className="action-icon-circle"><Users size={20} /></div>
              <span className="action-label">Team Members</span>
            </div>

            <div className="quick-action-button" onClick={() => navigate('/staff/permissions')}>
              <div className="action-icon-circle"><Lock size={20} /></div>
              <span className="action-label">Access Control</span>
            </div>

            <div className="quick-action-button">
              <div className="action-icon-circle"><Settings size={20} /></div>
              <span className="action-label">Settings</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
