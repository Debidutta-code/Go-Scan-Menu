import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../lib/api';
import { orderService } from '../../services/order.service';
import './OrderTracking.css';
import { Card, Loader } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { socketService } from '../../lib/socket';
import { Order } from '../../types/order.types';

const OrderTracking: React.FC = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();

    // Connect to WebSocket
    const socket = socketService.connect();

    // Listen for order updates
    socketService.onOrderStatusUpdate((updatedOrder) => {
      if (updatedOrder.orderNumber === orderNumber) {
        setOrder(updatedOrder);
      }
    });

    socketService.onOrderItemStatusUpdate((data) => {
      if (data.orderNumber === orderNumber) {
        fetchOrder();
      }
    });

    return () => {
      socketService.removeListener('order:status-update');
      socketService.removeListener('order:item-status-update');
    };
  }, [orderNumber]);

  const fetchOrder = async () => {
    try {
      const tableInfo = JSON.parse(localStorage.getItem('tableInfo') || '{}');
      const fetchedOrder = await orderService.getOrderByNumber(
        tableInfo.restaurantId,
        orderNumber!
      );
      setOrder(fetchedOrder);

      // Join table room for real-time updates
      if (fetchedOrder.tableId) {
        socketService.joinTable(fetchedOrder.tableId);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'gray',
      confirmed: 'blue',
      preparing: 'orange',
      ready: 'green',
      served: 'green',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'pending', label: 'Order Placed' },
      { status: 'confirmed', label: 'Confirmed' },
      { status: 'preparing', label: 'Preparing' },
      { status: 'ready', label: 'Ready' },
      { status: 'served', label: 'Served' },
    ];

    const currentIndex = steps.findIndex((s) => s.status === order?.status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return <Loader />;
  }

  if (!order) {
    return (
      <div className="order-tracking">
        <Navbar title="Order Tracking" />
        <div className="error-container">
          <h2>Order not found</h2>
          <p>The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <Navbar title="Order Tracking" />

      <div className="tracking-container container">
        {/* Order Header */}
        <Card className="order-header-card">
          <h1 className="order-number">Order #{order.orderNumber}</h1>
          <p className="table-info">Table {order.tableNumber}</p>
          <div className="order-meta">
            <span>Total: ₹{order.totalAmount.toFixed(2)}</span>
            <span>•</span>
            <span>{new Date(order.orderTime).toLocaleTimeString()}</span>
          </div>
        </Card>

        {/* Status Timeline */}
        <Card className="status-timeline-card">
          <h2 className="section-title">Order Status</h2>
          <div className="status-timeline">
            {getStatusSteps().map((step, index) => (
              <div key={step.status} className="timeline-step">
                <div className="timeline-marker">
                  <div
                    className={`marker-circle ${
                      step.completed ? 'completed' : ''
                    } ${step.active ? 'active' : ''}`}
                  >
                    {step.completed && '✓'}
                  </div>
                  {index < getStatusSteps().length - 1 && (
                    <div className={`marker-line ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
                <div className="timeline-content">
                  <p className={`step-label ${step.active ? 'active' : ''}`}>{step.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Items */}
        <Card className="order-items-card">
          <h2 className="section-title">Order Items</h2>
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">
                    {item.quantity}x {item.name}
                  </span>
                  <span className={`item-status status-${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <span className="item-price">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
