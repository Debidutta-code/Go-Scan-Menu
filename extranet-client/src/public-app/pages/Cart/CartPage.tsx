import React from 'react';
import { usePublicApp } from '../../contexts/PublicAppContext';
import { useCart } from '../../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import './CartPage.css';

export const CartPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const { cart, updateQuantity, removeItem, totalAmount } = useCart();
  const currency = menuData.branch.settings.currency;

  if (cart.length === 0) {
    return (
      <div className="public-cart-page-wrapper">
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <ShoppingBag size={64} color="#ccc" />
          </div>
          <h3>Your cart is empty</h3>
          <p>Add some delicious items from the menu!</p>
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
            {item.menuItem.image && (
              <img
                src={item.menuItem.image}
                alt={item.menuItem.name}
                className="cart-item-image"
              />
            )}
            <div className="cart-item-info">
              <div className="cart-item-header">
                <div>
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
                  onClick={() => removeItem(item.id)}
                  title="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="cart-item-controls">
                <span className="cart-item-price">
                  {currency} {(item.totalPrice * item.quantity).toFixed(2)}
                </span>
                <div className="quantity-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-summary">
          <span>Total Amount</span>
          <span>
            {currency} {totalAmount.toFixed(2)}
          </span>
        </div>
        <button className="checkout-btn">
          Place Order
        </button>
      </div>
    </div>
  );
};
