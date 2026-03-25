import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { formatPrice, getSpiceLevelEmoji, getDietaryIcon } from '@/public-app/utils/formatters';
import { useCart } from '@/public-app/contexts/CartContext';
import './MenuItemCard.css';
export const MenuItemCard = ({ item, currency, onItemClick, onAddClick, }) => {
    const { cart, addItem, updateQuantity, removeItem } = useCart();
    // Find the total quantity of this item in the cart
    const cartItems = cart.filter(i => i.menuItem._id === item._id);
    const totalQuantity = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const hasVariants = item.variants && item.variants.length > 0;
    const handleAddClick = (e) => {
        e.stopPropagation();
        onAddClick(item);
    };
    const handleMinusClick = (e) => {
        e.stopPropagation();
        // If it's a simple item and it's in the cart, reduce its quantity
        if (cartItems.length === 1 && !hasVariants) {
            if (cartItems[0].quantity > 1) {
                updateQuantity(cartItems[0]._id, -1);
            }
            else {
                removeItem(cartItems[0]._id);
            }
        }
        else if (hasVariants || cartItems.length > 1) {
            // For items with variants or multiple cart entries, open the detail view
            onItemClick(item);
        }
    };
    return (_jsxs("div", { className: `menu-item-card-horizontal ${!item.isAvailable ? 'unavailable' : ''}`, onClick: () => onItemClick(item), children: [_jsxs("div", { className: "menu-item-card-image-wrapper", children: [item.image ? (_jsx("img", { src: item.image, alt: item.name, className: "menu-item-card-image-horizontal", loading: "lazy" })) : (_jsx("div", { className: "menu-item-card-image-placeholder-horizontal", children: _jsx("span", { children: "\uD83C\uDF7D\uFE0F" }) })), item.dietaryType && (_jsx("div", { className: `menu-item-dietary-badge ${item.dietaryType.toLowerCase()}`, children: getDietaryIcon(item.dietaryType) })), !item.isAvailable && (_jsx("div", { className: "menu-item-card-unavailable-overlay", children: "N/A" }))] }), _jsxs("div", { className: "menu-item-card-info-horizontal", children: [_jsx("div", { className: "menu-item-card-top-row", children: _jsxs("div", { className: "menu-item-card-text-content", children: [_jsx("h3", { className: "menu-item-card-name-horizontal", children: item.name }), item.description && (_jsx("p", { className: "menu-item-card-description-horizontal", children: item.description })), _jsxs("div", { className: "menu-item-card-meta-horizontal", children: [item.preparationTime && (_jsxs("span", { className: "menu-item-card-meta-badge", children: ["\u23F1\uFE0F ", item.preparationTime, "min"] })), item.calories && (_jsxs("span", { className: "menu-item-card-meta-badge", children: [item.calories, " cal"] })), item.spiceLevel && (_jsx("span", { className: "menu-item-card-meta-badge", children: getSpiceLevelEmoji(item.spiceLevel) }))] })] }) }), _jsxs("div", { className: "menu-item-card-bottom-row", children: [_jsx("div", { className: "menu-item-card-price-horizontal", children: item.discountPrice ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "menu-item-card-discount-price-horizontal", children: formatPrice(item.discountPrice, currency) }), _jsx("span", { className: "menu-item-card-original-price-horizontal", children: formatPrice(item.price, currency) })] })) : (_jsx("span", { className: "menu-item-card-current-price-horizontal", children: formatPrice(item.price, currency) })) }), item.isAvailable && (_jsx("div", { className: "menu-item-card-actions", children: (!hasVariants && totalQuantity > 0) ? (_jsxs("div", { className: "menu-item-card-quantity-control", children: [_jsx("button", { className: "menu-item-card-quantity-btn-minus", onClick: handleMinusClick, children: "\u2212" }), _jsx("span", { className: "menu-item-card-quantity-display", children: totalQuantity }), _jsx("button", { className: "menu-item-card-quantity-btn-plus", onClick: handleAddClick, children: "+" })] })) : (_jsx("button", { className: "menu-item-card-add-btn", onClick: handleAddClick, children: "+" })) }))] })] })] }));
};
