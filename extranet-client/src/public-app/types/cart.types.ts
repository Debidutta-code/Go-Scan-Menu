import { MenuItem, Variant, Addon } from './menu.types';

export interface CartItem {
    id: string; // Unique ID for the cart item (item.id + variant?.id + chosen addons ids)
    menuItem: MenuItem;
    variant?: Variant;
    addons: Addon[];
    quantity: number;
    totalPrice: number;
}

export interface CartContextType {
    cart: CartItem[];
    addItem: (item: MenuItem, variant?: Variant, addons?: Addon[], quantity?: number) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}
