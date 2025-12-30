import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../lib/socket';
import './KitchenDisplay.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    status: string;
    specialInstructions?: string;
  }>;
  orderTime: string;
  status: string;
}

const KitchenDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    // Mock data
    setOrders([
      {
        _id: '1',
        orderNumber: 'ORD-001',
        tableNumber: 'T-5',
        items: [
          { name: 'Butter Chicken', quantity: 2, status: 'preparing' },
          { name: 'Naan', quantity: 4, status: 'preparing', specialInstructions: 'Extra butter' },
        ],
        orderTime: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'preparing',
      },
      {
        _id: '2',
        orderNumber: 'ORD-002',
        tableNumber: 'T-3',
        items: [{ name: 'Paneer Tikka', quantity: 1, status: 'pending' }],
        orderTime: new Date(Date.now() - 2 * 60000).toISOString(),
        status: 'confirmed',
      },
    ]);

    setupWebSocket();
  }, []);

  const setupWebSocket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const socket = socketService.connect();

    if (user.restaurantId && user.branchId) {
      socketService.joinKitchen(user.restaurantId, user.branchId);
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

  const getTimeSinceOrder = (orderTime: string) => {
    const diff = Date.now() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  };

  const getPriorityClass = (orderTime: string) => {
    const diff = Date.now() - new Date(orderTime).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes > 15) return 'urgent';
    if (minutes > 10) return 'warning';
    return 'normal';
  };

  return (
    <div className="kitchen-display">
      <Navbar
        title="👨‍🍳 Kitchen Display"
        actions={
          <div className="kitchen-stats">
            <span className="stat-badge">{orders.length} Active Orders</span>
          </div>
        }
      />

      <div className="kitchen-container">
        <div className="kitchen-grid">
          {orders.map((order) => (
            <Card
              key={order._id}
              className={`kitchen-order-card priority-${getPriorityClass(order.orderTime)}`}
            >
              <div className="kitchen-order-header">
                <div>
                  <h2 className="kitchen-order-number">#{order.orderNumber}</h2>
                  <span className="kitchen-table">Table {order.tableNumber}</span>
                </div>
                <div className="kitchen-time">
                  <span className="time-badge">{getTimeSinceOrder(order.orderTime)}</span>
                </div>
              </div>

              <div className="kitchen-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="kitchen-item">
                    <div className="item-header">
                      <span className="item-quantity">{item.quantity}x</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    {item.specialInstructions && (
                      <div className="item-instructions">📝 {item.specialInstructions}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="kitchen-actions">
                {order.status === 'confirmed' && (
                  <Button fullWidth size="lg" variant="primary">
                    Start Preparing
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button fullWidth size="lg" variant="primary">
                    Mark Ready
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="kitchen-empty">
            <div className="empty-icon">✅</div>
            <h2>All caught up!</h2>
            <p>No pending orders in the kitchen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
