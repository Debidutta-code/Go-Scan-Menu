import { MenuItem, Variant, Addon } from './menu.types';

export interface CartItem {
    id: string; // Unique ID for the cart item
    _id: string;
    menuItem: MenuItem;
    selectedModifiers: Array<{
        groupId: string;
        groupName: string;
        options: Array<{
            optionId: string;
            name: string;
            price: number;
        }>;
    }>;
    quantity: number;
    totalPrice: number;
}

export interface CartContextType {
    cart: CartItem[];
    addItem: (
        item: MenuItem,
        quantity: number,
        selectedModifiers: Array<{
            groupId: string;
            groupName: string;
            options: Array<{
                optionId: string;
                name: string;
                price: number;
            }>;
        }>
    ) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, delta: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}
