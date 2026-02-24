import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import './OrdersPage.css';

export const OrdersPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const location = useLocation();
  const { orderSuccess, orderDetails } = (location.state as any) || {};

  if (orderSuccess) {
    return (
      <div className="orders-page-wrapper">
        <div className="success-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ color: '#22c55e', marginBottom: '24px' }}>
            <CheckCircle size={80} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Order Placed!</h2>
          <p style={{ color: '#64748b', marginBottom: '32px' }}>
            Your order <strong>#{orderDetails?.orderNumber}</strong> has been received and is being prepared.
          </p>

          <div className="order-summary-card" style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', textAlign: 'left', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1e293b', fontWeight: '600' }}>
              <Clock size={20} />
              <span>Status: Pending Confirmation</span>
            </div>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Table</span>
                <span style={{ fontWeight: '500' }}>{orderDetails?.tableNumber || menuData.table?.tableNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Amount</span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>
                  {menuData.branch.settings.currency} {orderDetails?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Link to="../" className="checkout-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

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
};