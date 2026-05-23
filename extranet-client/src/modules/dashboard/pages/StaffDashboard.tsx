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
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import './StaffDashboard.css';

const DUMMY_STATS = [
  { label: 'Total Categories', value: '8', trend: 'Menu', trendUp: true, icon: ShoppingBag },
  { label: 'Total Items', value: '42', trend: 'Active', trendUp: true, icon: DollarSign },
  { label: 'Table Count', value: '15', trend: 'QR Active', trendUp: true, icon: TrendingUp },
  { label: 'Team Members', value: '6', trend: 'Staff', trendUp: true, icon: Users },
];

const POPULAR_ITEMS = [
  { rank: 1, name: 'Margherita Pizza', category: 'Main Course', views: 420 },
  { rank: 2, name: 'Truffle Pasta', category: 'Main Course', views: 385 },
  { rank: 3, name: 'Caesar Salad', category: 'Starters', views: 312 },
  { rank: 4, name: 'Iced Caramel Latte', category: 'Beverages', views: 289 },
  { rank: 5, name: 'Chocolate Lava Cake', category: 'Desserts', views: 254 },
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

          {/* Popular Items Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3 className="panel-title">Most Viewed Items</h3>
              <button className="select-all-button" onClick={() => navigate('/staff/menu')}>Manage Menu</button>
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
                    {item.views} views
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
