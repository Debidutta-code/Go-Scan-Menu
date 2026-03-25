import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuAPI } from '@/modules/menu/pages/api/menu-api';
import { Button } from '@/shared/components/Button';
import { MenuItemCard } from '@/modules/menu/pages/components/MenuItemCard/MenuItemCard';
import { getCategoryId } from '@/modules/menu/pages/utils/category-helpers';
import { MenuModal } from './MenuModal';
import './MenuManagement.css';
export const MenuManagement = () => {
    const navigate = useNavigate();
    const { staff, token, logout } = useStaffAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenuItemId, setEditingMenuItemId] = useState(null);
    // Per-item debounce control
    const debounceRef = React.useRef({});
    useEffect(() => {
        return () => {
            // Cleanup timeouts on unmount
            Object.values(debounceRef.current).forEach(clearTimeout);
        };
    }, []);
    useEffect(() => {
        if (staff && token) {
            loadData();
        }
    }, [staff, token]);
    const loadData = async () => {
        if (!staff || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const [categoriesData, menuItemsData] = await Promise.all([
                MenuAPI.getCategories(token, staff.restaurantId),
                MenuAPI.getMenuItems(token, staff.restaurantId),
            ]);
            setCategories(categoriesData);
            setMenuItems(menuItemsData);
        }
        catch (err) {
            setError(err.message || 'Failed to load menu data');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDeleteMenuItem = async (itemId, itemName) => {
        if (!staff || !token)
            return;
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`))
            return;
        try {
            const response = await MenuAPI.deleteMenuItem(token, staff.restaurantId._id, itemId);
            if (response.success) {
                alert('Menu item deleted successfully');
                loadData();
            }
        }
        catch (err) {
            alert(err.message || 'Failed to delete menu item');
        }
    };
    const handleToggleAvailability = (itemId, currentStatus) => {
        if (!staff || !token)
            return;
        const newStatus = !currentStatus;
        // 1. Optimistic Update (Immediate UI response)
        setMenuItems((prev) => prev.map((item) => item._id === itemId ? { ...item, isAvailable: newStatus } : item));
        // 2. Debounce API Call
        if (debounceRef.current[itemId]) {
            clearTimeout(debounceRef.current[itemId]);
        }
        debounceRef.current[itemId] = setTimeout(async () => {
            try {
                const response = await MenuAPI.updateAvailability(token, staff.restaurantId._id, itemId, newStatus);
                if (!response.success) {
                    throw new Error('Failed to update availability');
                }
            }
            catch (err) {
                // Rollback on absolute failure
                setMenuItems((prev) => prev.map((item) => item._id === itemId ? { ...item, isAvailable: currentStatus } : item));
                alert(err.message || 'Failed to update availability');
            }
            finally {
                delete debounceRef.current[itemId];
            }
        }, 500); // 500ms debounce
    };
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/staff/login');
        }
    };
    const handleAddMenuItem = () => {
        setEditingMenuItemId(null);
        setIsModalOpen(true);
    };
    const handleEditMenuItem = (itemId) => {
        setEditingMenuItemId(itemId);
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingMenuItemId(null);
    };
    const handleModalSuccess = () => {
        loadData();
    };
    const filteredMenuItems = selectedCategory === 'all'
        ? menuItems
        : menuItems.filter((item) => getCategoryId(item.categoryId) === selectedCategory);
    return (_jsxs("div", { className: "menu-management-layout", children: [_jsxs("div", { className: "menu-page-toolbar", children: [_jsx("h1", { className: "menu-page-title", "data-testid": "menu-management-title", children: "Menu Management" }), _jsxs("div", { className: "menu-toolbar-actions", children: [_jsx("div", { className: "menu-filter-container", children: _jsxs("select", { className: "menu-filter-select", value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), "data-testid": "category-filter", children: [_jsx("option", { value: "all", children: "All Categories" }), categories.map((category) => (_jsx("option", { value: category._id, children: category.name }, category._id)))] }) }), _jsx(Button, { variant: "outline", onClick: () => navigate('/staff/categories'), "data-testid": "manage-categories-button", size: "sm", children: "Manage Categories" }), _jsx(Button, { variant: "primary", onClick: handleAddMenuItem, "data-testid": "add-menu-item-button", size: "sm", children: "+ Add Item" })] })] }), error && _jsx("div", { className: "error-banner", children: error }), _jsx("div", { className: "menu-management-content", children: _jsxs("div", { className: "menu-list-panel", children: [_jsx("div", { className: "panel-header", children: _jsxs("h2", { className: "panel-title", children: ["Menu Items (", filteredMenuItems.length, ")"] }) }), _jsx("div", { className: "menu-list-container", children: loading && menuItems.length === 0 ? (_jsx("div", { className: "loading-state", children: "Loading menu data..." })) : filteredMenuItems.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83C\uDF7D\uFE0F" }), _jsx("p", { className: "empty-title", children: "No menu items yet" }), _jsx("p", { className: "empty-description", children: "Start by adding items to your menu" }), _jsx(Button, { variant: "primary", onClick: handleAddMenuItem, children: "+ Add Menu Item" })] })) : (_jsx("div", { className: "menu-items-grid", children: filteredMenuItems.map((item) => (_jsx(MenuItemCard, { item: item, categories: categories, onEdit: handleEditMenuItem, onDelete: handleDeleteMenuItem, onToggleAvailability: handleToggleAvailability }, item._id))) })) })] }) }), _jsx(MenuModal, { isOpen: isModalOpen, onClose: handleModalClose, menuItemId: editingMenuItemId, onSuccess: handleModalSuccess })] }));
};
