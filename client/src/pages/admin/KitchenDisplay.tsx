import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { socketService } from '../../lib/socket';
import './KitchenDisplay.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card } from '@/components/common';
import { Order } from '../../types/order.types';

const KitchenDisplay: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    fetchKitchenOrders();
    setupWebSocket();
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const allOrders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);

      // Filter only active orders for kitchen
      const kitchenOrders = allOrders.filter((o) =>
        ['confirmed', 'preparing', 'ready'].includes(o.status)
      );

      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    socketService.connect();

    if (user.restaurantId && user.branchId) {
      socketService.joinKitchen(user.restaurantId, user.branchId);
    }

    socketService.onOrderCreated((order) => {
      if (['confirmed', 'preparing'].includes(order.status)) {
        setOrders((prev) => [order, ...prev]);
      }
    });

    socketService.onOrderStatusUpdate((updatedOrder) => {
      setOrders((prev) => {
        // Remove if order is no longer active
        if (!['confirmed', 'preparing', 'ready'].includes(updatedOrder.status)) {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        // Update if exists, add if new
        const index = prev.findIndex((o) => o._id === updatedOrder._id);
        if (index >= 0) {
          const newOrders = [...prev];
          newOrders[index] = updatedOrder;
          return newOrders;
        }
        return [updatedOrder, ...prev];
      });
    });
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await orderService.updateOrderStatus(user.restaurantId, orderId, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
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
                    {item.variant && <div className="item-variant">🎯 {item.variant.name}</div>}
                    {item.addons.length > 0 && (
                      <div className="item-addons">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.customizations.length > 0 && (
                      <div className="item-customizations">
                        {item.customizations.map((c) => `${c.name}: ${c.value}`).join(', ')}
                      </div>
                    )}
                    {item.specialInstructions && (
                      <div className="item-instructions">📝 {item.specialInstructions}</div>
                    )}
                  </div>
                ))}
              </div>

              {order.specialInstructions && (
                <div className="order-special-instructions">
                  📝 Order Notes: {order.specialInstructions}
                </div>
              )}

              <div className="kitchen-actions">
                {order.status === 'confirmed' && (
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onClick={() => updateOrderStatus(order._id, 'preparing')}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    fullWidth
                    size="lg"
                    variant="primary"
                    onClick={() => updateOrderStatus(order._id, 'ready')}
                  >
                    Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <div className="ready-badge">✅ Ready for Service</div>
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
