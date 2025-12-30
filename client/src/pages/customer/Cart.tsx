import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { MenuItem } from '../../types/menu.types';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card, Input, Loader, Modal } from '@/components/common';
import './Cart.css';

interface CartItem extends MenuItem {
  quantity: number;
  selectedVariant?: { name: string; price: number };
  selectedAddons: Array<{ name: string; price: number }>;
  selectedCustomizations: Array<{ name: string; value: string }>;
  specialInstructions?: string;
  itemTotal: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderSpecialInstructions, setOrderSpecialInstructions] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const newQuantity = Math.max(0, newCart[index].quantity + delta);

    if (newQuantity === 0) {
      newCart.splice(index, 1);
    } else {
      newCart[index].quantity = newQuantity;
      // Recalculate itemTotal
      const item = newCart[index];
      let basePrice = item.selectedVariant?.price || item.price;
      item.selectedAddons.forEach((addon) => {
        basePrice += addon.price;
      });
      newCart[index].itemTotal = basePrice * newQuantity;
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.itemTotal, 0);
  };

  const getTax = () => {
    // Simple 5% GST for demo - in real app, this would come from backend
    return getSubtotal() * 0.05;
  };

  const getServiceCharge = () => {
    // Simple 10% service charge for demo
    return getSubtotal() * 0.1;
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getServiceCharge();
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
        customerEmail: customerEmail || undefined,
        specialInstructions: orderSpecialInstructions || undefined,
        items: cart.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.selectedVariant?.price || item.price,
          image: item.image,
          variant: item.selectedVariant,
          addons: item.selectedAddons,
          customizations: item.selectedCustomizations,
          specialInstructions: item.specialInstructions,
          itemTotal: item.itemTotal,
        })),
        orderType: 'dine-in' as const,
      };

      const order = await orderService.createOrder(tableInfo.restaurantId, orderData);

      // Clear cart
      localStorage.removeItem('cart');
      setCart([]);
      setShowCheckout(false);

      // Navigate to order tracking
      navigate(`/order-tracking/${order.orderNumber}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Failed to create order. Please try again.');
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
          {cart.map((item, index) => (
            <Card key={`${item._id}-${index}`} className="cart-item">
              {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
              <div className="cart-item-details">
                <div className="cart-item-header">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>

                {item.selectedVariant && (
                  <p className="cart-item-variant">{item.selectedVariant.name}</p>
                )}

                {item.selectedAddons.length > 0 && (
                  <div className="cart-item-addons">
                    <span className="addon-label">Add-ons:</span>
                    {item.selectedAddons.map((addon, i) => (
                      <span key={i} className="addon-item">
                        {addon.name}
                      </span>
                    ))}
                  </div>
                )}

                {item.selectedCustomizations.length > 0 && (
                  <div className="cart-item-customizations">
                    {item.selectedCustomizations.map((custom, i) => (
                      <span key={i} className="custom-item">
                        {custom.name}: {custom.value}
                      </span>
                    ))}
                  </div>
                )}

                {item.specialInstructions && (
                  <p className="cart-item-instructions">📝 {item.specialInstructions}</p>
                )}

                <div className="cart-item-footer">
                  <span className="cart-item-price">₹{item.itemTotal.toFixed(2)}</span>
                  <div className="quantity-controls">
                    <button className="quantity-btn" onClick={() => updateQuantity(index, -1)}>
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button className="quantity-btn" onClick={() => updateQuantity(index, 1)}>
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
              <span>GST (5%)</span>
              <span>₹{getTax().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Service Charge (10%)</span>
              <span>₹{getServiceCharge().toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
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
          <Input
            label="Email (Optional)"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter your email"
          />
          <div className="input-group">
            <label className="input-label">Special Instructions (Optional)</label>
            <textarea
              className="input"
              value={orderSpecialInstructions}
              onChange={(e) => setOrderSpecialInstructions(e.target.value)}
              placeholder="Any special requests for your order?"
              rows={3}
            />
          </div>
          <div className="checkout-summary">
            <div className="checkout-row">
              <span>Total Amount:</span>
              <span className="checkout-total">₹{getTotal().toFixed(2)}</span>
            </div>
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
