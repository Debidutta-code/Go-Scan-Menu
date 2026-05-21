import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './SuperAdminNavbar.css';

interface SuperAdminNavbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

export const SuperAdminNavbar: React.FC<SuperAdminNavbarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  isMobile
}) => {
  const { superAdmin } = useAuth();

  return (
    <header className="sadmin-navbar">
      <div className="navbar-left">
        {isMobile && (
          <button className="navbar-toggle-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        )}
        <div className="navbar-brand">
          <span className="navbar-title">SuperAdmin Dashboard</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-meta">
            <span className="user-name">{superAdmin?.name || 'Super Admin'}</span>
            <span className="user-role">System Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
