import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  QrCode,
  Users,
  BarChart,
  LogOut,
  ChevronLeft,
  Menu,
  Terminal
} from 'lucide-react';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import './SuperAdminSidebar.css';

interface SuperAdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  closeMobileSidebar: () => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  isOpen,
  toggleSidebar,
  isMobile,
  closeMobileSidebar
}) => {
  const { superAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/sadmin/login');
    }
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard',
    },
    {
      label: 'Restaurants',
      icon: <Store size={20} />,
      path: '/restaurants',
    },
    {
      label: 'QR Management',
      icon: <QrCode size={20} />,
      path: '/qr-management',
    },
    {
      label: 'Request Logs',
      icon: <Terminal size={20} />,
      path: '/api-logs',
    },
    {
      label: 'Staff Management',
      icon: <Users size={20} />,
      path: '#',
      disabled: true,
      badge: 'Soon'
    },
    {
      label: 'Analytics',
      icon: <BarChart size={20} />,
      path: '#',
      disabled: true,
      badge: 'Soon'
    }
  ];

  const sidebarClass = `sadmin-sidebar ${!isOpen && !isMobile ? 'collapsed' : ''} ${isMobile && isOpen ? 'mobile-open' : ''}`;

  return (
    <>
      <div className={sidebarClass}>
        <div className="sidebar-header">
          {(!isOpen && !isMobile) ? (
            <button className="toggle-btn collapsed-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          ) : (
            <div className="logo-container">
              <div className="logo-icon">SA</div>
              <span className="company-name">S-Admin Portal</span>
            </div>
          )}

          {!isMobile && isOpen && (
            <button className="toggle-btn" onClick={toggleSidebar}>
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.disabled) {
              return (
                <div key={index} className="nav-item disabled">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && isOpen && <span className="coming-soon-badge">{item.badge}</span>}
                </div>
              );
            }

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={isMobile ? closeMobileSidebar : undefined}
                end={item.path === '/dashboard'}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {isOpen && (
              <div className="user-details">
                <span className="user-email">{superAdmin?.email}</span>
              </div>
            )}
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {isMobile && (
        <div
          className={`mobile-overlay ${isOpen ? 'open' : ''}`}
          onClick={closeMobileSidebar}
        />
      )}
    </>
  );
};
