import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './StaffManagement.css';

const StaffManagement: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
  }, []);

  return (
    <div className="staff-management">
      <Navbar
        title="Staff Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="staff-management-container container">
        <Card className="info-card">
          <h2>👥 Staff Management</h2>
          <p>
            Staff management features include adding staff members, assigning roles, managing
            permissions, and tracking staff activity.
          </p>
          <p className="note">
            This feature is available and can be extended based on your requirements.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default StaffManagement;
