// src/pages/dashboard/Dashboard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { superAdmin } = useAuth();
  const navigate = useNavigate();

  // Safety check in case superAdmin is null (though it shouldn't be on this protected route)
  if (!superAdmin) {
    return null; // Or a loading spinner / redirect handled at route level
  }

  return (
    <div className="dashboard-container">
      <Header />

      <main className="main-content">
        <div className="welcome-card">
          <h1 className="welcome-title">Welcome back, Super Admin!</h1>
          <p className="welcome-text">
            You're logged in as <strong>{superAdmin.email}</strong>
          </p>

          <div className="module-grid">
            {/* Restaurants Module */}
            <div className="module-card" data-testid="restaurants-card">
              <div className="module-icon">🍽️</div>
              <h3 className="module-title">Restaurants</h3>
              <p className="module-description">
                Create and manage restaurant accounts, themes, subscriptions, and settings.
              </p>
              <button
                className="module-button primary"
                onClick={() => navigate('/restaurants')}
                data-testid="restaurants-button"
              >
                Manage Restaurants
              </button>
            </div>

            {/* Staff Module - Coming Soon */}
            <div className="module-card" data-testid="staff-card">
              <div className="module-icon">👥</div>
              <h3 className="module-title">Staff Management</h3>
              <p className="module-description">
                View and manage staff members across all restaurants.
              </p>
              <button className="module-button disabled" disabled>
                Coming Soon
              </button>
            </div>

            {/* Analytics Module - Coming Soon */}
            <div className="module-card" data-testid="analytics-card">
              <div className="module-icon">📊</div>
              <h3 className="module-title">Analytics & Reports</h3>
              <p className="module-description">
                System-wide statistics, performance insights, and custom reports.
              </p>
              <button className="module-button disabled" disabled>
                Coming Soon
              </button>
            </div>
          </div>

          {/* Optional: Quick Stats or Recent Activity Section */}
          <div className="quick-info">
            <p className="quick-info-text">
              Tip: Use the <strong>Restaurants</strong> module to create new restaurant accounts or edit existing ones.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};