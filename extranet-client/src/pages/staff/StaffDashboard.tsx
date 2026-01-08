// src/pages/staff/StaffDashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../../contexts/StaffAuthContext';
import { Button } from '../../components/ui/Button';
import './StaffDashboard.css';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { staff, logout } = useStaffAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/staff/login');
    }
  };

  const getRolePermissions = () => {
    if (!staff || !staff.permissions) return [];

    const permissions = [];
    const perms = staff.permissions;

    // Menu permissions
    if (perms.menu?.view) permissions.push('View Menu');
    if (perms.menu?.create) permissions.push('Create Menu Items');
    if (perms.menu?.update) permissions.push('Update Menu Items');
    if (perms.menu?.delete) permissions.push('Delete Menu Items');
    if (perms.menu?.manageCategories) permissions.push('Manage Categories');

    // Order permissions
    if (perms.orders?.view) permissions.push('View Orders');
    if (perms.orders?.create) permissions.push('Create Orders');
    if (perms.orders?.update) permissions.push('Update Orders');
    if (perms.orders?.managePayment) permissions.push('Manage Payments');

    // Staff permissions
    if (perms.staff?.view) permissions.push('View Staff');
    if (perms.staff?.create) permissions.push('Create Staff');
    if (perms.staff?.update) permissions.push('Update Staff');
    if (perms.staff?.manageRoles) permissions.push('Manage Roles');

    // Reports permissions
    if (perms.reports?.view) permissions.push('View Reports');
    if (perms.reports?.export) permissions.push('Export Reports');
    if (perms.reports?.viewFinancials) permissions.push('View Financials');

    // Settings permissions
    if (perms.settings?.view) permissions.push('View Settings');
    if (perms.settings?.updateRestaurant) permissions.push('Update Restaurant');
    if (perms.settings?.updateBranch) permissions.push('Update Branch');

    return permissions;
  };

  if (!staff) {
    return (
      <div className="staff-dashboard-container">
        <div className="loading-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-container">
      {/* Header */}
      <div className="staff-dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title" data-testid="staff-dashboard-title">
            GoScanMenu Staff Portal
          </h1>
          <div className="header-actions">
            <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="welcome-title">Welcome, {staff.name}!</h2>
        <p className="welcome-subtitle">
          Role: <span className="role-badge">
            {staff.staffType
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </span>
        </p>
      </div>

      {/* Staff Info Card */}
      <div className="info-card">
        <h3 className="card-title">Your Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <label className="info-label">Email</label>
            <p className="info-value" data-testid="staff-email">{staff.email}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Phone</label>
            <p className="info-value">{staff.phone}</p>
          </div>
          <div className="info-item">
            <label className="info-label">Staff Type</label>
            <p className="info-value">
              {staff.staffType
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </p>
          </div>
          <div className="info-item">
            <label className="info-label">Status</label>
            <p className="info-value">
              <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                {staff.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Permissions Card */}
      <div className="info-card">
        <h3 className="card-title">Your Permissions</h3>
        <div className="permissions-list">
          {getRolePermissions().length > 0 ? (
            getRolePermissions().map((permission) => (
              <div key={permission} className="permission-item">
                <span className="permission-icon">✓</span>
                <span className="permission-text">{permission}</span>
              </div>
            ))
          ) : (
            <p className="no-permissions">No special permissions assigned</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          {staff.permissions?.menu?.view && (
            <button
              className="action-card"
              onClick={() => navigate('/staff/menu')}
              data-testid="menu-management-button"
            >
              <div className="action-icon">📋</div>
              <h4 className="action-title">Menu Management</h4>
              <p className="action-description">Add, edit, and manage menu items</p>
            </button>
          )}

          {staff.permissions?.staff?.view && (
            <button
              className="action-card"
              onClick={() => navigate('/staff/team')}
              data-testid="staff-management-button"
            >
              <div className="action-icon">👥</div>
              <h4 className="action-title">Staff Management</h4>
              <p className="action-description">Manage team members and roles</p>
            </button>
          )}

          {staff.permissions?.staff?.manageRoles && (
            <button
              className="action-card"
              onClick={() => navigate('/staff/permissions')}
              data-testid="permissions-management-button"
            >
              <div className="action-icon">🔐</div>
              <h4 className="action-title">Role Permissions</h4>
              <p className="action-description">Configure role-based permissions</p>
            </button>
          )}

          {staff.permissions?.orders?.view && (
            <button className="action-card" disabled>
              <div className="action-icon">🛎️</div>
              <h4 className="action-title">Orders</h4>
              <p className="action-description">View and manage orders</p>
              <span className="coming-soon">Coming Soon</span>
            </button>
          )}

          {staff.permissions?.reports?.view && (
            <button className="action-card" disabled>
              <div className="action-icon">📊</div>
              <h4 className="action-title">Reports</h4>
              <p className="action-description">View sales and analytics</p>
              <span className="coming-soon">Coming Soon</span>
            </button>
          )}

          {staff.permissions?.settings?.view && (
            <button className="action-card" disabled>
              <div className="action-icon">⚙️</div>
              <h4 className="action-title">Settings</h4>
              <p className="action-description">Configure restaurant settings</p>
              <span className="coming-soon">Coming Soon</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
