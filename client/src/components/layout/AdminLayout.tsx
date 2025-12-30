// src/components/layout/AdminLayout.tsx

import React, { useState } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import { Header } from './Header';
import './AdminLayout.css';

export interface AdminLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  breadcrumbs?: Array<{ label: string; path?: string }>;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>;
  onNotificationClick?: (id: string) => void;
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  sidebarItems,
  activePath,
  onNavigate,
  user,
  breadcrumbs,
  notifications,
  onNotificationClick,
  onLogout,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="admin-layout-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`admin-layout-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          items={sidebarItems}
          activePath={activePath}
          onNavigate={handleNavigate}
          user={user}
        />
      </div>

      {/* Header */}
      <Header
        isSidebarCollapsed={isSidebarCollapsed}
        onSidebarToggle={handleSidebarToggle}
        breadcrumbs={breadcrumbs}
        notifications={notifications}
        onNotificationClick={onNotificationClick}
        onLogout={onLogout}
        user={user}
      />

      {/* Main Content */}
      <main className="admin-layout-main">
        <div className="admin-layout-content">{children}</div>
      </main>
    </div>
  );
};
