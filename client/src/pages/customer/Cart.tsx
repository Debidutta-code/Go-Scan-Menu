import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../lib/api';
import './Cart.css';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card, Input, Loader, Modal } from '@/components/common';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  isVeg: boolean;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const newCart = cart
      .map((item) => {
        if (item._id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (itemId: string) => {
    const newCart = cart.filter((item) => item._id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.05; // 5% tax
  };

  const getTotal = () => {
    return getSubtotal() + getTax();
  };

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number');
      return;
    }

    setLoading(true);
    try {
      const tableInfo = JSON.parse(localStorage.getItem('tableInfo') || '{}');

      const orderData = {
        branchId: tableInfo.branchId,
        tableId: tableInfo.tableId,
        tableNumber: tableInfo.tableNumber,
        customerName,
        customerPhone,
        specialInstructions,
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          addons: [],
          customizations: [],
          itemTotal: item.price * item.quantity,
        })),
        orderType: 'dine-in',
      };

      const response = await apiClient.post(
        `/restaurants/${tableInfo.restaurantId}/orders`,
        orderData
      );

      const order = response.data.data;

      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);
      setShowCheckout(false);

      // Navigate to order tracking
      navigate(`/order-tracking/${order.orderNumber}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <Navbar title="Your Cart" />
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add items from the menu to get started!</p>
          <Button onClick={() => navigate(-1)}>Browse Menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Navbar title="Your Cart" />

      <div className="cart-container container">
        <div className="cart-items">
          {cart.map((item) => (
            <Card key={item._id} className="cart-item">
              {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
              <div className="cart-item-details">
                <div className="cart-item-header">
                  <h3 className="cart-item-name">
                    <span className={`veg-indicator ${item.isVeg ? 'veg' : 'non-veg'}`}>•</span>
                    {item.name}
                  </h3>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item._id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
                <div className="cart-item-footer">
                  <span className="cart-item-price">₹{item.price * item.quantity}</span>
                  <div className="quantity-controls">
                    <button className="quantity-btn" onClick={() => updateQuantity(item._id, -1)}>
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button className="quantity-btn" onClick={() => updateQuantity(item._id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="cart-summary">
          <Card>
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{getSubtotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (5%)</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
            <Button fullWidth size="lg" onClick={() => setShowCheckout(true)}>
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => !loading && setShowCheckout(false)}
        title="Complete Your Order"
        size="md"
      >
        <div className="checkout-form">
          <Input
            label="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter your phone number"
            required
          />
          <div className="input-group">
            <label className="input-label">Special Instructions (Optional)</label>
            <textarea
              className="input"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests?"
              rows={3}
            />
          </div>
          <div className="checkout-actions">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCheckout(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleCheckout} loading={loading}>
              Place Order
            </Button>
          </div>
        </div>
      </Modal>

      {loading && <Loader />}
    </div>
  );
};

export default Cart;
