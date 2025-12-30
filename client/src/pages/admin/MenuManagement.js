import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuService } from '../../services/menu.service';
import { Button, Card, Loader, Modal, Input } from '@/components/common';
import { Navbar } from '@/components/ui/Navbar/Navbar';
import './MenuManagement.css';
const MenuManagement = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Form states
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        image: '',
    });
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
    });
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }
        fetchMenuData();
    }, []);
    const fetchMenuData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const [fetchedCategories, fetchedItems] = await Promise.all([
                menuService.getCategories(user.restaurantId),
                menuService.getMenuItems(user.restaurantId),
            ]);
            setCategories(fetchedCategories);
            setMenuItems(fetchedItems);
        }
        catch (error) {
            console.error('Error fetching menu data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddCategory = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await menuService.createCategory(user.restaurantId, categoryForm);
            setShowAddCategoryModal(false);
            setCategoryForm({ name: '', description: '' });
            fetchMenuData();
        }
        catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        }
    };
    const handleAddItem = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await menuService.createMenuItem(user.restaurantId, {
                ...itemForm,
                price: parseFloat(itemForm.price),
            });
            setShowAddItemModal(false);
            setItemForm({ name: '', description: '', price: '', categoryId: '', image: '' });
            fetchMenuData();
        }
        catch (error) {
            console.error('Error adding menu item:', error);
            alert('Failed to add menu item');
        }
    };
    const handleToggleAvailability = async (itemId, currentStatus) => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await menuService.updateMenuItem(user.restaurantId, itemId, {
                isAvailable: !currentStatus,
            });
            fetchMenuData();
        }
        catch (error) {
            console.error('Error updating item:', error);
        }
    };
    const getFilteredItems = () => {
        if (selectedCategory === 'all')
            return menuItems;
        return menuItems.filter((item) => item.categoryId === selectedCategory);
    };
    if (loading) {
        return _jsx(Loader, {});
    }
    return (_jsxs("div", { className: "menu-management", children: [_jsx(Navbar, { title: "Menu Management", actions: _jsx(Button, { size: "sm", onClick: () => navigate('/admin/dashboard'), children: "Dashboard" }) }), _jsxs("div", { className: "menu-management-container container", children: [_jsxs("div", { className: "actions-bar", children: [_jsx(Button, { onClick: () => setShowAddCategoryModal(true), children: "\u2795 Add Category" }), _jsx(Button, { onClick: () => setShowAddItemModal(true), children: "\u2795 Add Menu Item" })] }), _jsxs("div", { className: "category-tabs", children: [_jsx("button", { className: `category-tab ${selectedCategory === 'all' ? 'active' : ''}`, onClick: () => setSelectedCategory('all'), children: "All Items" }), categories.map((cat) => (_jsx("button", { className: `category-tab ${selectedCategory === cat._id ? 'active' : ''}`, onClick: () => setSelectedCategory(cat._id), children: cat.name }, cat._id)))] }), _jsx("div", { className: "menu-items-grid", children: getFilteredItems().map((item) => (_jsxs(Card, { className: "menu-item-card-admin", children: [item.image && (_jsxs("div", { className: "admin-item-image", children: [_jsx("img", { src: item.image, alt: item.name }), !item.isAvailable && _jsx("div", { className: "unavailable-overlay", children: "Unavailable" })] })), _jsxs("div", { className: "admin-item-content", children: [_jsx("h3", { className: "admin-item-name", children: item.name }), _jsx("p", { className: "admin-item-description", children: item.description }), _jsxs("div", { className: "admin-item-footer", children: [_jsxs("span", { className: "admin-item-price", children: ["\u20B9", item.price] }), _jsx(Button, { size: "sm", variant: item.isAvailable ? 'secondary' : 'primary', onClick: () => handleToggleAvailability(item._id, item.isAvailable), children: item.isAvailable ? 'Mark Unavailable' : 'Mark Available' })] })] })] }, item._id))) }), getFilteredItems().length === 0 && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "No menu items found. Add your first item!" }) }))] }), _jsx(Modal, { isOpen: showAddCategoryModal, onClose: () => setShowAddCategoryModal(false), title: "Add New Category", size: "md", children: _jsxs("div", { className: "form-modal", children: [_jsx(Input, { label: "Category Name", value: categoryForm.name, onChange: (e) => setCategoryForm({ ...categoryForm, name: e.target.value }), placeholder: "Enter category name", required: true }), _jsx(Input, { label: "Description (Optional)", value: categoryForm.description, onChange: (e) => setCategoryForm({ ...categoryForm, description: e.target.value }), placeholder: "Enter description" }), _jsxs("div", { className: "modal-actions", children: [_jsx(Button, { variant: "secondary", onClick: () => setShowAddCategoryModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleAddCategory, children: "Add Category" })] })] }) }), _jsx(Modal, { isOpen: showAddItemModal, onClose: () => setShowAddItemModal(false), title: "Add New Menu Item", size: "md", children: _jsxs("div", { className: "form-modal", children: [_jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "Category" }), _jsxs("select", { className: "input", value: itemForm.categoryId, onChange: (e) => setItemForm({ ...itemForm, categoryId: e.target.value }), required: true, children: [_jsx("option", { value: "", children: "Select Category" }), categories.map((cat) => (_jsx("option", { value: cat._id, children: cat.name }, cat._id)))] })] }), _jsx(Input, { label: "Item Name", value: itemForm.name, onChange: (e) => setItemForm({ ...itemForm, name: e.target.value }), placeholder: "Enter item name", required: true }), _jsx(Input, { label: "Description", value: itemForm.description, onChange: (e) => setItemForm({ ...itemForm, description: e.target.value }), placeholder: "Enter description" }), _jsx(Input, { label: "Price (\u20B9)", type: "number", value: itemForm.price, onChange: (e) => setItemForm({ ...itemForm, price: e.target.value }), placeholder: "Enter price", required: true }), _jsx(Input, { label: "Image URL (Optional)", value: itemForm.image, onChange: (e) => setItemForm({ ...itemForm, image: e.target.value }), placeholder: "Enter image URL" }), _jsxs("div", { className: "modal-actions", children: [_jsx(Button, { variant: "secondary", onClick: () => setShowAddItemModal(false), children: "Cancel" }), _jsx(Button, { onClick: handleAddItem, children: "Add Item" })] })] }) })] }));
};
export default MenuManagement;
