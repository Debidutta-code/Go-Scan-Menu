import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useCart } from '@/public-app/contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from 'lucide-react';
import { getDietaryIcon } from '@/public-app/utils/formatters';
import { PublicOrderService } from '@/public-app/services/public-order.service';
import './CartPage.css';
export const CartPage = () => {
    const { menuData } = usePublicApp();
    const { cart, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
    const [itemToRemove, setItemToRemove] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const navigate = useNavigate();
    const currency = menuData.branch.settings.currency;
    const handleMinus = (id, quantity) => {
        if (quantity === 1) {
            setItemToRemove(id);
        }
        else {
            updateQuantity(id, -1);
        }
    };
    const confirmRemove = () => {
        if (itemToRemove) {
            removeItem(itemToRemove);
            setItemToRemove(null);
        }
    };
    const handleCheckout = async () => {
        console.log('Checkout initiated', { menuData, cart });
        if (!menuData.table?._id) {
            console.warn('Table ID missing');
            setOrderError('Table information missing. Please scan the QR code again.');
            return;
        }
        setIsPlacingOrder(true);
        setOrderError(null);
        const orderData = {
            branchId: menuData.branch._id,
            tableId: menuData.table._id,
            orderType: 'dine-in',
            items: cart.map(item => ({
                menuItemId: item.menuItem._id,
                quantity: item.quantity,
                variantName: item.variant?.name,
                addons: item.addons.map(a => ({ name: a.name, price: a.price })),
            }))
        };
        console.log('Placing order with data:', orderData);
        try {
            const response = await PublicOrderService.createOrder(menuData.restaurant.slug, menuData.branch.code, orderData);
            console.log('Order response:', response);
            if (response.success) {
                clearCart();
                navigate('../orders', { state: { orderSuccess: true, orderDetails: response.data } });
            }
            else {
                setOrderError(response.message || 'Failed to place order. Please try again.');
            }
        }
        catch (err) {
            console.error('Order placement error:', err);
            setOrderError(err.message || 'An unexpected error occurred. Please try again.');
        }
        finally {
            setIsPlacingOrder(false);
        }
    };
    if (cart.length === 0) {
        return (_jsx("div", { className: "public-cart-page-wrapper", children: _jsxs("div", { className: "empty-cart", children: [_jsx("div", { className: "empty-cart-icon-container", children: _jsx(ShoppingBag, { size: 56, color: "#94a3b8" }) }), _jsx("h3", { children: "Your cart is empty" }), _jsx("p", { children: "Add some delicious items from the menu!" }), _jsx("button", { className: "checkout-btn", style: { padding: '12px 24px', fontSize: '15px' }, onClick: () => window.history.back(), children: "Browse Menu" })] }) }));
    }
    return (_jsxs("div", { className: "public-cart-page-wrapper", children: [_jsx("div", { className: "cart-header", children: _jsx("h2", { children: "Your Cart" }) }), _jsx("div", { className: "cart-items-list", children: cart.map((item) => (_jsxs("div", { className: "cart-item-card", children: [item.menuItem.image ? (_jsx("img", { src: item.menuItem.image, alt: item.menuItem.name, className: "cart-item-image" })) : (_jsx("div", { className: "cart-item-image", style: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }, children: "\uD83C\uDF7D\uFE0F" })), _jsxs("div", { className: "cart-item-info", children: [_jsxs("div", { className: "cart-item-header", children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' }, children: [item.menuItem.dietaryType && (_jsx("span", { style: { fontSize: '14px' }, children: getDietaryIcon(item.menuItem.dietaryType) })), _jsx("h4", { className: "cart-item-name", children: item.menuItem.name })] }), (item.variant || item.addons.length > 0) && (_jsxs("div", { className: "cart-item-details", children: [item.variant && _jsx("span", { children: item.variant.name }), item.addons.map((addon) => (_jsxs("span", { children: [", ", addon.name] }, addon._id)))] }))] }), _jsx("button", { className: "remove-btn", onClick: () => setItemToRemove(item._id), title: "Remove item", children: _jsx(Trash2, { size: 16 }) })] }), _jsxs("div", { className: "cart-item-controls", children: [_jsxs("span", { className: "cart-item-price", children: [currency, " ", (item.totalPrice * item.quantity).toFixed(2)] }), _jsxs("div", { className: "quantity-controls", children: [_jsx("button", { className: "qty-btn", onClick: () => handleMinus(item._id, item.quantity), children: _jsx(Minus, { size: 14 }) }), _jsx("span", { className: "qty-value", children: item.quantity }), _jsx("button", { className: "qty-btn", onClick: () => updateQuantity(item._id, 1), children: _jsx(Plus, { size: 14 }) })] })] })] })] }, item._id))) }), _jsxs("div", { className: "cart-footer", children: [orderError && (_jsxs("div", { className: "order-error-message", style: { color: '#ef4444', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }, children: [_jsx(AlertCircle, { size: 14, style: { display: 'inline', marginRight: '4px', verticalAlign: 'middle' } }), orderError] })), _jsxs("div", { className: "cart-summary", children: [_jsx("span", { className: "summary-label", children: "Total Amount" }), _jsxs("span", { className: "summary-value", children: [currency, " ", totalAmount.toFixed(2)] })] }), _jsx("button", { className: "checkout-btn", onClick: handleCheckout, disabled: isPlacingOrder, children: isPlacingOrder ? 'Placing Order...' : 'Checkout Now' })] }), itemToRemove && (_jsx("div", { className: "removal-confirmation-overlay", onClick: () => setItemToRemove(null), children: _jsxs("div", { className: "removal-confirmation-modal", onClick: e => e.stopPropagation(), children: [_jsx("div", { style: { color: '#ef4444', marginBottom: '16px' }, children: _jsx(AlertCircle, { size: 48, style: { margin: '0 auto' } }) }), _jsx("h3", { className: "confirmation-tile", children: "Remove Item?" }), _jsx("p", { className: "confirmation-desc", children: "Are you sure you want to remove this item from your cart?" }), _jsxs("div", { className: "confirmation-actions", children: [_jsx("button", { className: "confirm-cancel", onClick: () => setItemToRemove(null), children: "Cancel" }), _jsx("button", { className: "confirm-yes", onClick: confirmRemove, children: "Remove" })] })] }) }))] }));
};
