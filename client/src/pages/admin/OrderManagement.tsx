import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { socketService } from '../../lib/socket';
import './OrderManagement.css';
import { Button, Card, Loader, Modal } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Order } from '../../types/order.types';

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    socketService.connect();

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
      if (selectedOrder?._id === updatedOrder._id) {
        setSelectedOrder(updatedOrder);
      }
    });
  };

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const fetchedOrders = await orderService.getOrdersByBranch(user.restaurantId, user.branchId);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
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
      completed: 'gray',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
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
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed
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
                  {order.customerName && <p className="order-customer">{order.customerName}</p>}
                </div>
                <span className={`order-status status-${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="more-items">+{order.items.length - 3} more items</p>
                )}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">₹{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="order-actions">
                  <Button size="sm" variant="secondary" onClick={() => viewOrderDetails(order)}>
                    View
                  </Button>
                  {order.status === 'pending' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'confirmed')}>
                      Confirm
                    </Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'preparing')}>
                      Start Preparing
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
            <div className="empty-icon">📋</div>
            <p>No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Order #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="order-details-modal">
            <div className="detail-section">
              <h3>Customer Information</h3>
              <div className="detail-row">
                <span>Name:</span>
                <span>{selectedOrder.customerName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Phone:</span>
                <span>{selectedOrder.customerPhone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Table:</span>
                <span>{selectedOrder.tableNumber}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Order Items</h3>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="detail-item">
                  <div className="item-header-detail">
                    <span className="item-name">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="item-price">₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                  {item.variant && <p className="item-variant">Variant: {item.variant.name}</p>}
                  {item.addons.length > 0 && (
                    <p className="item-addons">
                      Add-ons: {item.addons.map((a) => a.name).join(', ')}
                    </p>
                  )}
                  {item.specialInstructions && (
                    <p className="item-instructions">📝 {item.specialInstructions}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="detail-section">
              <h3>Payment Summary</h3>
              <div className="detail-row">
                <span>Subtotal:</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span>Tax:</span>
                <span>₹{selectedOrder.totalTaxAmount.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span>Service Charge:</span>
                <span>₹{selectedOrder.serviceChargeAmount.toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="detail-row">
                  <span>Discount:</span>
                  <span>-₹{selectedOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="detail-row detail-total">
                <span>Total:</span>
                <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.specialInstructions && (
              <div className="detail-section">
                <h3>Special Instructions</h3>
                <p className="special-notes">{selectedOrder.specialInstructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
