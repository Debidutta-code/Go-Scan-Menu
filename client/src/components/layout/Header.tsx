// src/components/layout/Header.tsx

import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
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
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed,
  onSidebarToggle,
  breadcrumbs = [],
  notifications = [],
  onNotificationClick,
  onLogout,
  user,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onSidebarToggle} aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        {breadcrumbs.length > 0 && (
          <nav className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                {crumb.path ? (
                  <a href={crumb.path} className="breadcrumb-link">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div className="header-notifications" ref={notificationRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6.5C15 5.17 14.33 3.92 13.24 3.17C12.15 2.42 10.77 2.25 9.53 2.71C8.29 3.17 7.29 4.21 6.83 5.52C6.37 6.83 6.5 8.29 7.17 9.48L6 10.65V12.5H7.85L9 11.35C10.19 12.02 11.65 12.15 12.96 11.69C14.27 11.23 15.31 10.23 15.77 8.99C16.23 7.75 16.06 6.37 15.31 5.28" />
            </svg>
            {unreadCount > 0 && <span className="header-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="header-dropdown notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className="notification-count">{unreadCount} new</span>}
              </div>
              <div className="dropdown-body">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : ''}`}
                      onClick={() => {
                        onNotificationClick?.(notification.id);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">{notification.time}</div>
                      </div>
                      {!notification.read && <span className="notification-dot" />}
                    </button>
                  ))
                ) : (
                  <div className="dropdown-empty">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M24 8v16l8 8M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z" />
                    </svg>
                    <p>No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        {user && (
          <div className="header-user" ref={userMenuRef}>
            <button
              className="header-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="header-user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="header-user-name">{user.name}</span>
              <svg
                className={`header-user-arrow ${showUserMenu ? 'open' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="header-dropdown user-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user.name}</div>
                  <div className="dropdown-user-email">{user.email}</div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                    <path d="M14.25 9c0 .83-.17 1.62-.47 2.34l1.27 1.27-1.06 1.06-1.27-1.27A5.23 5.23 0 019 14.25a5.23 5.23 0 01-3.72-1.85l-1.27 1.27-1.06-1.06 1.27-1.27A5.23 5.23 0 013.75 9c0-.83.17-1.62.47-2.34L2.95 5.39l1.06-1.06 1.27 1.27A5.23 5.23 0 019 3.75c1.39 0 2.66.54 3.72 1.85l1.27-1.27 1.06 1.06-1.27 1.27c.3.72.47 1.51.47 2.34z" />
                  </svg>
                  <span>Settings</span>
                </button>
                <button className="dropdown-item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11.25V9M9 6.75h.0075M15.75 9a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
                  </svg>
                  <span>Help</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-item-danger" onClick={onLogout}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11.25 12.75L14.25 9.75 11.25 6.75M14.25 9.75H6.75M6.75 3.75H5.25A1.5 1.5 0 003.75 5.25v7.5a1.5 1.5 0 001.5 1.5h1.5" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};