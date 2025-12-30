import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menu.service';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import { Button, Card, Modal } from '@/components/common';
import { Loader } from '@/components/common/Loader';
import './CustomerMenu.css';
const CustomerMenu = () => {
    const { restaurantSlug, branchCode, qrCode } = useParams();
    const navigate = useNavigate();
    const [menuData, setMenuData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    // Customization state
    const [selectedVariant, setSelectedVariant] = useState();
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [customizations, setCustomizations] = useState({});
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [quantity, setQuantity] = useState(1);
    useEffect(() => {
        fetchMenu();
        loadCart();
    }, [restaurantSlug, branchCode, qrCode]);
    const fetchMenu = async () => {
        try {
            let data;
            if (qrCode) {
                data = await menuService.getMenuByQrCode(restaurantSlug, branchCode, qrCode);
            }
            else {
                data = await menuService.getMenuByBranch(restaurantSlug, branchCode);
            }
            setMenuData(data);
        }
        catch (error) {
            console.error('Error fetching menu:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    };
    const saveCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        if (menuData) {
            localStorage.setItem('tableInfo', JSON.stringify({
                restaurantId: menuData.restaurant._id,
                branchId: menuData.branch._id,
                tableId: menuData.table?._id,
                tableNumber: menuData.table?.tableNumber,
            }));
        }
    };
    const openCustomizeModal = (item) => {
        setSelectedItem(item);
        setSelectedVariant(item.variants.find((v) => v.isDefault));
        setSelectedAddons([]);
        setCustomizations({});
        setSpecialInstructions('');
        setQuantity(1);
        setShowCustomizeModal(true);
    };
    const calculateItemTotal = () => {
        if (!selectedItem)
            return 0;
        let total = selectedVariant?.price || selectedItem.price;
        selectedAddons.forEach((addon) => {
            total += addon.price;
        });
        return total * quantity;
    };
    const addToCart = () => {
        if (!selectedItem)
            return;
        const customizationsArray = Object.entries(customizations).map(([name, value]) => ({
            name,
            value,
        }));
        const cartItem = {
            ...selectedItem,
            quantity,
            selectedVariant,
            selectedAddons: [...selectedAddons],
            selectedCustomizations: customizationsArray,
            specialInstructions,
            itemTotal: calculateItemTotal(),
        };
        const newCart = [...cart, cartItem];
        saveCart(newCart);
        setShowCustomizeModal(false);
    };
    const quickAdd = (item) => {
        if (item.variants.length > 0 || item.addons.length > 0 || item.customizations.length > 0) {
            openCustomizeModal(item);
        }
        else {
            const cartItem = {
                ...item,
                quantity: 1,
                selectedAddons: [],
                selectedCustomizations: [],
                itemTotal: item.price,
            };
            const existingIndex = cart.findIndex((i) => i._id === item._id && i.selectedAddons.length === 0);
            let newCart;
            if (existingIndex >= 0) {
                newCart = [...cart];
                newCart[existingIndex].quantity += 1;
                newCart[existingIndex].itemTotal =
                    newCart[existingIndex].price * newCart[existingIndex].quantity;
            }
            else {
                newCart = [...cart, cartItem];
            }
            saveCart(newCart);
        }
    };
    const toggleAddon = (addon) => {
        const exists = selectedAddons.find((a) => a.name === addon.name);
        if (exists) {
            setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
        }
        else {
            setSelectedAddons([...selectedAddons, addon]);
        }
    };
    const getCartItemCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    };
    const filteredItems = () => {
        if (!menuData)
            return [];
        if (selectedCategory === 'all') {
            return menuData.categories.flatMap((cat) => cat.items);
        }
        const category = menuData.categories.find((cat) => cat._id === selectedCategory);
        return category?.items || [];
    };
    if (loading) {
        return _jsx(Loader, {});
    }
    if (!menuData) {
        return (_jsxs("div", { className: "error-container", children: [_jsx("h2", { children: "Menu not found" }), _jsx("p", { children: "The restaurant or branch you're looking for doesn't exist." })] }));
    }
    return (_jsxs("div", { className: "customer-menu", children: [_jsx(Navbar, { title: menuData.restaurant.name, actions: _jsxs(Button, { size: "sm", onClick: () => navigate('/cart'), children: ["\uD83D\uDED2 Cart (", getCartItemCount(), ")"] }) }), _jsxs("div", { className: "menu-header", children: [_jsx("h1", { children: menuData.branch.name }), menuData.table && _jsxs("p", { className: "table-number", children: ["Table: ", menuData.table.tableNumber] })] }), _jsxs("div", { className: "category-filter", children: [_jsx("button", { className: `category-btn ${selectedCategory === 'all' ? 'active' : ''}`, onClick: () => setSelectedCategory('all'), children: "All" }), menuData.categories.map((cat) => (_jsx("button", { className: `category-btn ${selectedCategory === cat._id ? 'active' : ''}`, onClick: () => setSelectedCategory(cat._id), children: cat.name }, cat._id)))] }), _jsx("div", { className: "menu-items-container container", children: _jsx("div", { className: "menu-items-grid", children: filteredItems().map((item) => (_jsxs(Card, { className: "menu-item-card", children: [item.image && (_jsx("div", { className: "menu-item-image", children: _jsx("img", { src: item.image, alt: item.name }) })), _jsxs("div", { className: "menu-item-content", children: [_jsx("h3", { className: "menu-item-name", children: item.name }), item.description && _jsx("p", { className: "menu-item-description", children: item.description }), item.spiceLevel && (_jsx("div", { className: "menu-item-tags", children: _jsxs("span", { className: "spice-tag", children: [item.spiceLevel === 'mild' && '🌶️', item.spiceLevel === 'medium' && '🌶️🌶️', item.spiceLevel === 'hot' && '🌶️🌶️🌶️', item.spiceLevel === 'extra_hot' && '🌶️🌶️🌶️🌶️'] }) })), _jsxs("div", { className: "menu-item-footer", children: [_jsxs("div", { children: [_jsxs("span", { className: "menu-item-price", children: ["\u20B9", item.price] }), item.discountPrice && (_jsxs("span", { className: "menu-item-discount", children: ["\u20B9", item.discountPrice] }))] }), _jsx(Button, { size: "sm", disabled: !item.isAvailable, onClick: () => quickAdd(item), children: item.isAvailable ? 'Add' : 'Unavailable' })] })] })] }, item._id))) }) }), getCartItemCount() > 0 && (_jsxs("button", { className: "floating-cart-btn", onClick: () => navigate('/cart'), children: ["\uD83D\uDED2", _jsx("span", { className: "floating-cart-badge", children: getCartItemCount() })] })), _jsx(Modal, { isOpen: showCustomizeModal, onClose: () => setShowCustomizeModal(false), title: selectedItem?.name || '', size: "lg", children: selectedItem && (_jsxs("div", { className: "customize-modal", children: [selectedItem.image && (_jsx("img", { src: selectedItem.image, alt: selectedItem.name, className: "modal-item-image" })), _jsx("p", { className: "modal-item-description", children: selectedItem.description }), selectedItem.variants.length > 0 && (_jsxs("div", { className: "customize-section", children: [_jsx("h3", { children: "Choose Size/Variant" }), _jsx("div", { className: "variant-options", children: selectedItem.variants.map((variant) => (_jsxs("button", { className: `variant-option ${selectedVariant?.name === variant.name ? 'selected' : ''}`, onClick: () => setSelectedVariant(variant), children: [_jsx("span", { children: variant.name }), _jsxs("span", { children: ["\u20B9", variant.price] })] }, variant.name))) })] })), selectedItem.addons.length > 0 && (_jsxs("div", { className: "customize-section", children: [_jsx("h3", { children: "Add Extras" }), _jsx("div", { className: "addon-options", children: selectedItem.addons.map((addon) => (_jsxs("label", { className: "addon-option", children: [_jsx("input", { type: "checkbox", checked: selectedAddons.some((a) => a.name === addon.name), onChange: () => toggleAddon(addon) }), _jsx("span", { children: addon.name }), _jsxs("span", { children: ["+\u20B9", addon.price] })] }, addon.name))) })] })), selectedItem.customizations.map((custom) => (_jsxs("div", { className: "customize-section", children: [_jsxs("h3", { children: [custom.name, custom.isRequired && _jsx("span", { className: "required", children: "*" })] }), _jsx("div", { className: "customization-options", children: custom.options.map((option) => (_jsxs("label", { className: "radio-option", children: [_jsx("input", { type: "radio", name: custom.name, value: option, checked: customizations[custom.name] === option, onChange: (e) => setCustomizations({ ...customizations, [custom.name]: e.target.value }) }), _jsx("span", { children: option })] }, option))) })] }, custom.name))), _jsxs("div", { className: "customize-section", children: [_jsx("h3", { children: "Special Instructions" }), _jsx("textarea", { className: "special-instructions", placeholder: "Any special requests?", value: specialInstructions, onChange: (e) => setSpecialInstructions(e.target.value), rows: 3 })] }), _jsxs("div", { className: "quantity-section", children: [_jsx("h3", { children: "Quantity" }), _jsxs("div", { className: "quantity-controls", children: [_jsx("button", { className: "quantity-btn", onClick: () => setQuantity(Math.max(1, quantity - 1)), children: "\u2212" }), _jsx("span", { className: "quantity-value", children: quantity }), _jsx("button", { className: "quantity-btn", onClick: () => setQuantity(quantity + 1), children: "+" })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsxs("div", { className: "modal-total", children: [_jsx("span", { children: "Total:" }), _jsxs("span", { className: "total-amount", children: ["\u20B9", calculateItemTotal()] })] }), _jsx(Button, { fullWidth: true, size: "lg", onClick: addToCart, children: "Add to Cart" })] })] })) })] }));
};
export default CustomerMenu;
