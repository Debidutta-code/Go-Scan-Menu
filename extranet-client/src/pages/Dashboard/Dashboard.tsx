// src/pages/dashboard/Dashboard.tsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/layout/Header';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { superAdmin } = useAuth();

  return (
    <div className="dashboard-container">
      <Header />

      <main className="main-content">
        <div className="welcome-card">
          <h2 className="welcome-title">SuperAdmin Dashboard</h2>
          <p className="welcome-text">
            You're logged in as <strong>{superAdmin?.email}</strong>
          </p>
          
          <div className="module-grid">
            <div className="module-card">
              <div className="module-icon">🍽️</div>
              <h3 className="module-title">Restaurants</h3>
              <p className="module-description">
                Manage restaurant accounts and settings
              </p>
              <button className="module-button" disabled>
                Coming Soon
              </button>
            </div>

            <div className="module-card">
              <div className="module-icon">👥</div>
              <h3 className="module-title">Staff</h3>
              <p className="module-description">
                View and manage staff across restaurants
              </p>
              <button className="module-button" disabled>
                Coming Soon
              </button>
            </div>

            <div className="module-card">
              <div className="module-icon">📊</div>
              <h3 className="module-title">Analytics</h3>
              <p className="module-description">
                System-wide statistics and reports
              </p>
              <button className="module-button" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};