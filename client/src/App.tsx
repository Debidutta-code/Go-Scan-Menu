// src/App.tsx - Complete demo with layout

import React, { useState } from 'react';
import { AdminLayout } from './components/layout';
import { Button, Card, CardHeader, CardBody, Input } from './components/common';
import type { SidebarItem } from './components/layout';
import './App.css';

function App() {
  const [activePath, setActivePath] = useState('/dashboard');

  // Mock user data
  const user = {
    name: 'John Doe',
    email: 'john@restaurant.com',
    role: 'Restaurant Owner',
    avatar: undefined,
  };

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'New Order',
      message: 'Table #5 placed a new order',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      message: 'Tomatoes running low in inventory',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      title: 'Staff Check-in',
      message: 'Sarah Johnson checked in',
      time: '2 hours ago',
      read: true,
    },
  ];

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      path: '/dashboard',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/orders',
      badge: 5,
    },
    {
      id: 'menu',
      label: 'Menu Management',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/menu',
      children: [
        {
          id: 'menu-categories',
          label: 'Categories',
          icon: <span>📁</span>,
          path: '/menu/categories',
        },
        {
          id: 'menu-items',
          label: 'Menu Items',
          icon: <span>🍽️</span>,
          path: '/menu/items',
        },
      ],
    },
    {
      id: 'tables',
      label: 'Table Management',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      path: '/tables',
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/staff',
    },
    {
      id: 'branches',
      label: 'Branches',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/branches',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/settings',
    },
  ];

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard' },
  ];

  const handleNavigate = (path: string) => {
    setActivePath(path);
    console.log('Navigating to:', path);
  };

  const handleNotificationClick = (id: string) => {
    console.log('Notification clicked:', id);
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <AdminLayout
      sidebarItems={sidebarItems}
      activePath={activePath}
      onNavigate={handleNavigate}
      user={user}
      breadcrumbs={breadcrumbs}
      notifications={notifications}
      onNotificationClick={handleNotificationClick}
      onLogout={handleLogout}
    >
      {/* Dashboard Content */}
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user.name}!</p>
          </div>
          <Button variant="primary">Create New Order</Button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card hoverable>
            <CardBody>
              <div className="stat-card">
                <div className="stat-icon stat-icon-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value">$12,345</div>
                  <div className="stat-change stat-change-positive">+12.5%</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className="stat-card">
                <div className="stat-icon stat-icon-success">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">156</div>
                  <div className="stat-change stat-change-positive">+8.2%</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className="stat-card">
                <div className="stat-icon stat-icon-warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Active Customers</div>
                  <div className="stat-value">89</div>
                  <div className="stat-change stat-change-positive">+5.1%</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card hoverable>
            <CardBody>
              <div className="stat-card">
                <div className="stat-icon stat-icon-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Occupied Tables</div>
                  <div className="stat-value">12/20</div>
                  <div className="stat-change">60% capacity</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <Card>
            <CardHeader>
              <h2>Recent Orders</h2>
            </CardHeader>
            <CardBody>
              <div className="order-list">
                <div className="order-item">
                  <div className="order-info">
                    <div className="order-id">#ORD-1234</div>
                    <div className="order-customer">Table 5 • John Smith</div>
                  </div>
                  <div className="order-status">
                    <span className="status-badge status-pending">Pending</span>
                    <div className="order-amount">$45.50</div>
                  </div>
                </div>
                <div className="order-item">
                  <div className="order-info">
                    <div className="order-id">#ORD-1233</div>
                    <div className="order-customer">Table 3 • Sarah Johnson</div>
                  </div>
                  <div className="order-status">
                    <span className="status-badge status-completed">Completed</span>
                    <div className="order-amount">$78.90</div>
                  </div>
                </div>
                <div className="order-item">
                  <div className="order-info">
                    <div className="order-id">#ORD-1232</div>
                    <div className="order-customer">Table 7 • Mike Wilson</div>
                  </div>
                  <div className="order-status">
                    <span className="status-badge status-preparing">Preparing</span>
                    <div className="order-amount">$32.00</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default App;