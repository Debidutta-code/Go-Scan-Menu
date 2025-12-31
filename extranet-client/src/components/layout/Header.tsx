// src/components/layout/Header.tsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const { superAdmin, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">GoScanMenu</h1>
        <div className="header-right">
          <span className="user-name">Welcome, {superAdmin?.name}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};