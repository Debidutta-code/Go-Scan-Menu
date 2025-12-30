// src/components/layout/Sidebar.tsx

import React, { useState } from 'react';
import './Sidebar.css';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: SidebarItem[];
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  items: SidebarItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  items,
  activePath,
  onNavigate,
  user,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = activePath === item.path;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="sidebar-item-wrapper">
        <button
          className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${
            level > 0 ? 'sidebar-item-nested' : ''
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              onNavigate(item.path);
            }
          }}
          title={isCollapsed ? item.label : undefined}
        >
          <span className="sidebar-item-icon">{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="sidebar-item-badge">{item.badge}</span>
              )}
              {hasChildren && (
                <span className={`sidebar-item-arrow ${isExpanded ? 'expanded' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                </span>
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="sidebar-submenu">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 4c-4.4 0-8 3.6-8 8 0 5.5 8 16 8 16s8-10.5 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" />
            </svg>
          </div>
          {!isCollapsed && <span className="sidebar-logo-text">RestaurantOS</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7h14M3 13h14" />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-items">
          {items.map((item) => renderSidebarItem(item))}
        </div>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{user.role}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};