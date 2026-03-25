import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
const CartContext = createContext(null);
const CART_STORAGE_KEY = 'go_scan_menu_cart';
export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            }
            catch (error) {
                console.error('Failed to parse cart from localStorage', error);
            }
        }
    }, []);
    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);
    const totalItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
    const totalAmount = useMemo(() => cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0), [cart]);
    const addItem = (item, variant, addons = [], quantity = 1) => {
        setCart((prevCart) => {
            // Create a unique ID based on item, variant, and addons
            const addonIds = addons.map(a => a._id).sort().join(',');
            const cartItemId = `${item._id}-${variant?._id || 'default'}-${addonIds}`;
            const existingItemIndex = prevCart.findIndex((i) => i._id === cartItemId);
            const itemPrice = variant ? variant.price : item.price;
            const addonsPrice = addons.reduce((acc, a) => acc + a.price, 0);
            const unitTotalPrice = itemPrice + addonsPrice;
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity,
                };
                return newCart;
            }
            const newItem = {
                id: cartItemId,
                _id: cartItemId,
                menuItem: item,
                variant,
                addons,
                quantity,
                totalPrice: unitTotalPrice,
            };
            return [...prevCart, newItem];
        });
    };
    const removeItem = (cartItemId) => {
        setCart((prevCart) => prevCart.filter((item) => item._id !== cartItemId));
    };
    const updateQuantity = (cartItemId, delta) => {
        setCart((prevCart) => {
            return prevCart.map((item) => {
                if (item._id === cartItemId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };
    const clearCart = () => {
        setCart([]);
    };
    return (_jsx(CartContext.Provider, { value: {
            cart,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalAmount,
        }, children: children }));
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
