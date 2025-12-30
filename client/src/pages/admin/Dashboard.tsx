import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Card } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { socketService } from '../../lib/socket';
import { Order } from '../../types/order.types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    activeOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const socket = socketService.connect();

    if (user.branchId) {
      socketService.joinBranch(user.branchId);
    }

    socketService.onOrderCreated((order) => {
      setRecentOrders((prev) => [order, ...prev.slice(0, 4)]);
      updateStats();
    });

    socketService.onOrderStatusUpdate((updatedOrder) => {
      setRecentOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
      updateStats();
    });
  };

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const orders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);

      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter((o) => new Date(o.orderTime).toDateString() === today);

      const stats = {
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        activeOrders: orders.filter((o) =>
          ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
        ).length,
      };

      setStats(stats);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    fetchDashboardData();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'purple',
      ready: 'green',
      served: 'green',
      completed: 'gray',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  return (
    <div className="admin-dashboard">
      <Navbar title="Dashboard" />

      <div className="dashboard-container container">
        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action-btn orders-btn" onClick={() => navigate('/admin/orders')}>
            <span className="action-icon">📋</span>
            <span className="action-label">Orders</span>
          </button>
          <button className="quick-action-btn menu-btn" onClick={() => navigate('/admin/menu')}>
            <span className="action-icon">🍴</span>
            <span className="action-label">Menu</span>
          </button>
          <button
            className="quick-action-btn kitchen-btn"
            onClick={() => navigate('/admin/kitchen')}
          >
            <span className="action-icon">👨‍🍳</span>
            <span className="action-label">Kitchen</span>
          </button>
          <button className="quick-action-btn tables-btn" onClick={() => navigate('/admin/tables')}>
            <span className="action-icon">🪑</span>
            <span className="action-label">Tables</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card stat-primary">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.todayOrders}</h3>
              <p className="stat-label">Today's Orders</p>
            </div>
          </Card>

          <Card className="stat-card stat-success">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-value">₹{stats.todayRevenue.toFixed(0)}</h3>
              <p className="stat-label">Today's Revenue</p>
            </div>
          </Card>

          <Card className="stat-card stat-warning">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.pendingOrders}</h3>
              <p className="stat-label">Pending Orders</p>
            </div>
          </Card>

          <Card className="stat-card stat-info">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.activeOrders}</h3>
              <p className="stat-label">Active Orders</p>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="recent-orders-card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
              View All →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order._id} className="order-row">
                  <div className="order-info">
                    <span className="order-number">#{order.orderNumber}</span>
                    <span className="order-table">Table {order.tableNumber}</span>
                    <span className={`order-status status-${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <span className="order-items">{order.items.length} items</span>
                    <span className="order-amount">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
