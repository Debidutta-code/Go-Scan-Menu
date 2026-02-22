import React, { useState } from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { useCart } from '../../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const { cart, updateQuantity, removeItem, totalAmount } = useCart();
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const currency = menuData.branch.settings.currency;

  const handleMinus = (id: string, quantity: number) => {
    if (quantity === 1) {
      setItemToRemove(id);
    } else {
      updateQuantity(id, -1);
    }
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeItem(itemToRemove);
      setItemToRemove(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="public-cart-page-wrapper">
        <div className="empty-cart">
          <div className="empty-cart-icon-container">
            <ShoppingBag size={56} color="#94a3b8" />
          </div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items from the menu!</p>
          <button
            className="checkout-btn"
            style={{ padding: '12px 24px', fontSize: '15px' }}
            onClick={() => window.history.back()}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-cart-page-wrapper">
      <div className="cart-header">
        <h2>Your Cart</h2>
      </div>

      <div className="cart-items-list">
        {cart.map((item) => (
          <div key={item.id} className="cart-item-card">
            {item.menuItem.image ? (
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="cart-item-image"
              />
            ) : (
              <div className="cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                🍽️
              </div>
            )}
            <div className="cart-item-info">
              <div className="cart-item-header">
                <div style={{ minWidth: 0 }}>
                  <h4 className="cart-item-name">{item.menuItem.name}</h4>
                  {(item.variant || item.addons.length > 0) && (
                    <div className="cart-item-details">
                      {item.variant && <span>{item.variant.name}</span>}
                      {item.addons.map((addon) => (
                        <span key={addon._id}>, {addon.name}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => setItemToRemove(item.id)}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="cart-item-controls">
                <span className="cart-item-price">
                  {currency} {(item.totalPrice * item.quantity).toFixed(2)}
                </span>
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => handleMinus(item.id, item.quantity)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-summary">
          <span className="summary-label">Total Amount</span>
          <span className="summary-value">
            {currency} {totalAmount.toFixed(2)}
          </span>
        </div>
        <button className="checkout-btn">
          Checkout Now
        </button>
      </div>

      {itemToRemove && (
        <div className="removal-confirmation-overlay" onClick={() => setItemToRemove(null)}>
          <div className="removal-confirmation-modal" onClick={e => e.stopPropagation()}>
            <div style={{ color: '#ef4444', marginBottom: '16px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 className="confirmation-tile">Remove Item?</h3>
            <p className="confirmation-desc">
              Are you sure you want to remove this item from your cart?
            </p>
            <div className="confirmation-actions">
              <button className="confirm-cancel" onClick={() => setItemToRemove(null)}>
                Cancel
              </button>
              <button className="confirm-yes" onClick={confirmRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
