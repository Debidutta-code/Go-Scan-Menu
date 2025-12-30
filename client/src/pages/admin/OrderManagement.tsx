import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import { socketService } from '../../lib/socket';
import './OrderManagement.css';
import { Button, Card, Loader } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';

interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  customerName?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  orderTime: string;
}

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const socket = socketService.connect();

    if (user.branchId) {
      socketService.joinBranch(user.branchId);
    }

    socketService.onOrderCreated((order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socketService.onOrderStatusUpdate((updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    });
  };

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Mock data for demo
      const mockOrders: Order[] = [
        {
          _id: '1',
          orderNumber: 'ORD-001',
          tableNumber: 'T-5',
          customerName: 'John Doe',
          items: [
            { name: 'Butter Chicken', quantity: 2, price: 350 },
            { name: 'Naan', quantity: 4, price: 40 },
          ],
          totalAmount: 860,
          status: 'preparing',
          orderTime: new Date().toISOString(),
        },
        {
          _id: '2',
          orderNumber: 'ORD-002',
          tableNumber: 'T-3',
          customerName: 'Jane Smith',
          items: [{ name: 'Paneer Tikka', quantity: 1, price: 280 }],
          totalAmount: 280,
          status: 'pending',
          orderTime: new Date().toISOString(),
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.status === filter);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'purple',
      ready: 'green',
      served: 'green',
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="order-management">
      <Navbar
        title="Order Management"
        actions={
          <Button size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
        }
      />

      <div className="orders-container container">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'preparing' ? 'active' : ''}`}
            onClick={() => setFilter('preparing')}
          >
            Preparing
          </button>
          <button
            className={`filter-tab ${filter === 'ready' ? 'active' : ''}`}
            onClick={() => setFilter('ready')}
          >
            Ready
          </button>
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {getFilteredOrders().map((order) => (
            <Card key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3 className="order-number">#{order.orderNumber}</h3>
                  <p className="order-table">Table: {order.tableNumber}</p>
                </div>
                <span className={`order-status status-${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">₹{order.totalAmount}</span>
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'confirmed')}>
                      Confirm
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'ready')}>
                      Mark Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'served')}>
                      Mark Served
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {getFilteredOrders().length === 0 && (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
