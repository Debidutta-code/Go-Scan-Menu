import { useState, useCallback } from 'react';
import { getCart, setCart as saveCart, clearCart as clearCartStorage } from '@/utils/storage.util';
import { orderService, CreateOrderData } from '@/services/order.service';

export const useOrder = () => {
  const [cart, setCartState] = useState<any[]>(getCart());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((item: any) => {
    const currentCart = getCart();
    const existingItemIndex = currentCart.findIndex(
      (cartItem: any) => 
        cartItem.menuItemId === item.menuItemId &&
        JSON.stringify(cartItem.variant) === JSON.stringify(item.variant) &&
        JSON.stringify(cartItem.addons) === JSON.stringify(item.addons)
    );

    if (existingItemIndex >= 0) {
      currentCart[existingItemIndex].quantity += item.quantity;
      currentCart[existingItemIndex].itemTotal = 
        currentCart[existingItemIndex].quantity * 
        (currentCart[existingItemIndex].price + 
         (currentCart[existingItemIndex].variant?.price || 0) +
         currentCart[existingItemIndex].addons.reduce((sum: number, addon: any) => sum + addon.price, 0));
    } else {
      currentCart.push(item);
    }

    saveCart(currentCart);
    setCartState(currentCart);
  }, []);

  const removeFromCart = useCallback((index: number) => {
    const currentCart = getCart();
    currentCart.splice(index, 1);
    saveCart(currentCart);
    setCartState(currentCart);
  }, []);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const currentCart = getCart();
    currentCart[index].quantity = quantity;
    currentCart[index].itemTotal = 
      quantity * 
      (currentCart[index].price + 
       (currentCart[index].variant?.price || 0) +
       currentCart[index].addons.reduce((sum: number, addon: any) => sum + addon.price, 0));
    
    saveCart(currentCart);
    setCartState(currentCart);
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    clearCartStorage();
    setCartState([]);
  }, []);

  const getCartTotal = useCallback(() => {
    const currentCart = getCart();
    return currentCart.reduce((total: number, item: any) => total + item.itemTotal, 0);
  }, []);

  const getCartItemCount = useCallback(() => {
    const currentCart = getCart();
    return currentCart.reduce((count: number, item: any) => count + item.quantity, 0);
  }, []);

  const placeOrder = async (restaurantId: string, orderData: CreateOrderData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.createOrder(restaurantId, orderData);
      clearCart();
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderByNumber = async (orderNumber: string) => {
    try {
      setLoading(true);
      const response: any = await orderService.getOrderByNumber(orderNumber);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    fetchOrderByNumber,
  };
};
