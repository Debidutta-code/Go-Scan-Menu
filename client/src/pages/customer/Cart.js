import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card, Input, Loader, Modal } from '@/components/common';
import './Cart.css';
const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
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
    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        const newQuantity = Math.max(0, newCart[index].quantity + delta);
        if (newQuantity === 0) {
            newCart.splice(index, 1);
        }
        else {
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
    const removeItem = (index) => {
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
                orderType: 'dine-in',
            };
            const order = await orderService.createOrder(tableInfo.restaurantId, orderData);
            // Clear cart
            localStorage.removeItem('cart');
            setCart([]);
            setShowCheckout(false);
            // Navigate to order tracking
            navigate(`/order-tracking/${order.orderNumber}`);
        }
        catch (error) {
            console.error('Error creating order:', error);
            alert(error.response?.data?.message || 'Failed to create order. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    if (cart.length === 0) {
        return (_jsxs("div", { className: "cart-page", children: [_jsx(Navbar, { title: "Your Cart" }), _jsxs("div", { className: "empty-cart", children: [_jsx("div", { className: "empty-cart-icon", children: "\uD83D\uDED2" }), _jsx("h2", { children: "Your cart is empty" }), _jsx("p", { children: "Add items from the menu to get started!" }), _jsx(Button, { onClick: () => navigate(-1), children: "Browse Menu" })] })] }));
    }
    return (_jsxs("div", { className: "cart-page", children: [_jsx(Navbar, { title: "Your Cart" }), _jsxs("div", { className: "cart-container container", children: [_jsx("div", { className: "cart-items", children: cart.map((item, index) => (_jsxs(Card, { className: "cart-item", children: [item.image && _jsx("img", { src: item.image, alt: item.name, className: "cart-item-image" }), _jsxs("div", { className: "cart-item-details", children: [_jsxs("div", { className: "cart-item-header", children: [_jsx("h3", { className: "cart-item-name", children: item.name }), _jsx("button", { className: "cart-item-remove", onClick: () => removeItem(index), "aria-label": "Remove item", children: "\u00D7" })] }), item.selectedVariant && (_jsx("p", { className: "cart-item-variant", children: item.selectedVariant.name })), item.selectedAddons.length > 0 && (_jsxs("div", { className: "cart-item-addons", children: [_jsx("span", { className: "addon-label", children: "Add-ons:" }), item.selectedAddons.map((addon, i) => (_jsx("span", { className: "addon-item", children: addon.name }, i)))] })), item.selectedCustomizations.length > 0 && (_jsx("div", { className: "cart-item-customizations", children: item.selectedCustomizations.map((custom, i) => (_jsxs("span", { className: "custom-item", children: [custom.name, ": ", custom.value] }, i))) })), item.specialInstructions && (_jsxs("p", { className: "cart-item-instructions", children: ["\uD83D\uDCDD ", item.specialInstructions] })), _jsxs("div", { className: "cart-item-footer", children: [_jsxs("span", { className: "cart-item-price", children: ["\u20B9", item.itemTotal.toFixed(2)] }), _jsxs("div", { className: "quantity-controls", children: [_jsx("button", { className: "quantity-btn", onClick: () => updateQuantity(index, -1), children: "\u2212" }), _jsx("span", { className: "quantity-value", children: item.quantity }), _jsx("button", { className: "quantity-btn", onClick: () => updateQuantity(index, 1), children: "+" })] })] })] })] }, `${item._id}-${index}`))) }), _jsx("div", { className: "cart-summary", children: _jsxs(Card, { children: [_jsx("h2", { className: "summary-title", children: "Order Summary" }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["\u20B9", getSubtotal().toFixed(2)] })] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "GST (5%)" }), _jsxs("span", { children: ["\u20B9", getTax().toFixed(2)] })] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { children: "Service Charge (10%)" }), _jsxs("span", { children: ["\u20B9", getServiceCharge().toFixed(2)] })] }), _jsx("div", { className: "summary-divider" }), _jsxs("div", { className: "summary-row summary-total", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["\u20B9", getTotal().toFixed(2)] })] }), _jsx(Button, { fullWidth: true, size: "lg", onClick: () => setShowCheckout(true), children: "Proceed to Checkout" })] }) })] }), _jsx(Modal, { isOpen: showCheckout, onClose: () => !loading && setShowCheckout(false), title: "Complete Your Order", size: "md", children: _jsxs("div", { className: "checkout-form", children: [_jsx(Input, { label: "Your Name", value: customerName, onChange: (e) => setCustomerName(e.target.value), placeholder: "Enter your name", required: true }), _jsx(Input, { label: "Phone Number", type: "tel", value: customerPhone, onChange: (e) => setCustomerPhone(e.target.value), placeholder: "Enter your phone number", required: true }), _jsx(Input, { label: "Email (Optional)", type: "email", value: customerEmail, onChange: (e) => setCustomerEmail(e.target.value), placeholder: "Enter your email" }), _jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "Special Instructions (Optional)" }), _jsx("textarea", { className: "input", value: orderSpecialInstructions, onChange: (e) => setOrderSpecialInstructions(e.target.value), placeholder: "Any special requests for your order?", rows: 3 })] }), _jsx("div", { className: "checkout-summary", children: _jsxs("div", { className: "checkout-row", children: [_jsx("span", { children: "Total Amount:" }), _jsxs("span", { className: "checkout-total", children: ["\u20B9", getTotal().toFixed(2)] })] }) }), _jsxs("div", { className: "checkout-actions", children: [_jsx(Button, { variant: "secondary", fullWidth: true, onClick: () => setShowCheckout(false), disabled: loading, children: "Cancel" }), _jsx(Button, { fullWidth: true, onClick: handleCheckout, loading: loading, children: "Place Order" })] })] }) }), loading && _jsx(Loader, {})] }));
};
export default Cart;
