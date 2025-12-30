import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button } from '@/components/common';

const MenuManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="menu-management">
      <Navbar
        title="Menu Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="menu-container container">
        <div className="placeholder-content">
          <div className="placeholder-icon">🍴</div>
          <h2>Menu Management</h2>
          <p>Full menu management functionality can be implemented here</p>
          <p>Features include:</p>
          <ul>
            <li>Add/Edit/Delete menu items</li>
            <li>Manage categories</li>
            <li>Set prices and availability</li>
            <li>Upload images</li>
            <li>Manage variants and addons</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
