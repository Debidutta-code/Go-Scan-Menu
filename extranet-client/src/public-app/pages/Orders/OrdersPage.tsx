import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { CheckCircle, Clock, ShoppingBag, Loader2, IndianRupee } from 'lucide-react';
import { PublicOrderService } from '../../services/order.service';
import './OrdersPage.css';

export const OrdersPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!menuData.table?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await PublicOrderService.getOrdersByTable(menuData.table.id);
        if (response.success) {
          // Response.data contains { orders, pagination }
          setOrders(response.data.orders || []);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [menuData.table?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#64748b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#f59e0b';
      case 'ready': return '#10b981';
      case 'served': return '#84cc16';
      case 'completed': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="orders-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" size={40} color="#3b82f6" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page-wrapper">
        <div className="empty-orders" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="empty-cart-icon-container" style={{ background: '#f1f5f9', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShoppingBag size={48} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No active orders</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
          <Link to="../" className="checkout-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <div className="orders-header" style={{ padding: '20px', background: '#fff', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, zIndex: 10 }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>My Orders</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Table {menuData.table?.tableNumber}</p>
      </div>

      <div className="orders-list" style={{ padding: '16px' }}>
        {error && (
          <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {orders.map((order) => (
          <div key={order._id} className="order-card" style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>#{order.orderNumber}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(order.status) }}></div>
                  <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{getStatusLabel(order.status)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '16px' }}>
                  {menuData.branch.settings.currency} {order.totalAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                  <div style={{ color: '#475569' }}>
                    <span style={{ fontWeight: '600', marginRight: '8px', color: '#3b82f6' }}>{item.quantity}x</span>
                    <span>{item.name}</span>
                    {item.variant && <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '4px' }}>({item.variant.name})</span>}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    {menuData.branch.settings.currency} {item.itemTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <div style={{ marginTop: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                <strong>Note:</strong> {order.specialInstructions}
              </div>
            )}
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '40px' }}>
          <Link to="../" className="checkout-btn" style={{ textDecoration: 'none', display: 'inline-block', background: '#f1f5f9', color: '#475569' }}>
            Add More Items
          </Link>
        </div>
      </div>
    </div>
  );
};
