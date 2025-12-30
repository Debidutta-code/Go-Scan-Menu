import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './BranchManagement.css';

const BranchManagement: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
  }, []);

  return (
    <div className="branch-management">
      <Navbar
        title="Branch Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="branch-management-container container">
        <Card className="info-card">
          <h2>🏢 Branch Management</h2>
          <p>
            Branch management allows you to manage multiple locations for chain restaurants,
            configure branch-specific settings, and monitor performance across branches.
          </p>
          <p className="note">
            This feature is available and can be extended based on your requirements.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default BranchManagement;
