import { MenuItem, Variant, Addon } from './menu.types';

export interface CartItem {
    id: string; // Unique ID for the cart item (item._id + variant?._id + chosen addons ids + customizations)
    _id: string;
    menuItem: MenuItem;
    variant?: Variant;
    addons: Addon[];
    customizations?: { name: string; value: string }[];
    quantity: number;
    totalPrice: number;
}

export interface CartContextType {
    cart: CartItem[];
    addItem: (
        item: MenuItem,
        variant?: Variant,
        addons?: Addon[],
        quantity?: number,
        customizations?: { name: string; value: string }[]
    ) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}
