import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, EyeOff, X } from 'lucide-react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuService } from '@/modules/menu/services/menu.service';
import { Button } from '@/shared/components/Button';
import { CategoryPreview } from './CategoryPreview';
import { CategoryListSkeleton } from './CategoryListSkeleton';
import { CategoryModal } from './CategoryModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { SortableCategoryItem } from './SortableCategoryItem';
import './CategoryManagement.css';
export const CategoryManagement = () => {
    const navigate = useNavigate();
    const { staff, token } = useStaffAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    // Preview toggle state
    const [showPreview, setShowPreview] = useState(window.innerWidth > 1024);
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    useEffect(() => {
        console.log('CategoryManagement mounted');
        return () => {
            console.log('CategoryManagement unmounted');
        };
    }, []);
    useEffect(() => {
        if (staff && token) {
            loadCategories();
        }
    }, [staff, token]);
    const loadCategories = async () => {
        if (!staff || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await MenuService.getCategories(token, staff.restaurantId);
            if (response.success && response.data) {
                setCategories(response.data.categories || []);
            }
        }
        catch (err) {
            setError(err.message || 'Failed to load categories');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }
        const oldIndex = categories.findIndex((cat) => cat._id === active.id);
        const newIndex = categories.findIndex((cat) => cat._id === over.id);
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newCategories);
        await updateDisplayOrders(newCategories);
    };
    const updateDisplayOrders = async (reorderedCategories) => {
        if (!staff || !token)
            return;
        setSaving(true);
        try {
            await Promise.all(reorderedCategories.map((category, index) => MenuService.updateCategoryDisplayOrder(token, staff.restaurantId, category._id, index)));
        }
        catch (err) {
            setError('Failed to update category order');
            await loadCategories();
        }
        finally {
            setSaving(false);
        }
    };
    /* Handlers */
    const handleAddCategory = useCallback(() => {
        setEditingCategoryId(null);
        setIsModalOpen(true);
    }, []);
    const handleEditCategory = useCallback((categoryId) => {
        setEditingCategoryId(categoryId);
        setIsModalOpen(true);
    }, []);
    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingCategoryId(null);
    }, []);
    const handleModalSuccess = useCallback(() => {
        loadCategories();
    }, [staff, token]);
    return (_jsxs("div", { className: "category-management-layout", children: [error && _jsx("div", { className: "error-banner", children: error }), _jsxs("div", { className: "category-page-toolbar", children: [_jsx("h1", { className: "category-page-title", children: "Category Management" }), _jsxs("div", { className: "category-toolbar-actions", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "preview-toggle-btn", onClick: () => setShowPreview(!showPreview), children: [showPreview ? _jsx(EyeOff, { size: 18 }) : _jsx(Smartphone, { size: 18 }), _jsx("span", { className: "btn-text", children: showPreview ? 'Hide Preview' : 'View Mobile' })] }), _jsx("div", { className: "category-search-container", children: _jsx("input", { type: "text", placeholder: "Search categories...", className: "category-search-input", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }) }), _jsx(Button, { variant: "primary", onClick: handleAddCategory, size: "sm", children: "+ Add Category" })] })] }), _jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: _jsxs("div", { className: "category-management-content", children: [_jsxs("div", { className: "category-list-panel", children: [_jsx("div", { className: "panel-header", children: _jsxs("h2", { className: "panel-title", children: ["Categories ", !loading && `(${categories.length})`] }) }), _jsx("div", { className: "category-list-container", children: loading ? (_jsx(CategoryListSkeleton, {})) : categories.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("div", { className: "empty-icon", children: "\uD83D\uDCCB" }), _jsx("p", { className: "empty-title", children: "No categories yet" }), _jsx("p", { className: "empty-description", children: "Start by adding your first category to organize your menu" }), _jsx(Button, { variant: "primary", onClick: handleAddCategory, children: "+ Add Category" })] })) : (_jsx(SortableContext, { items: categories.map((cat) => cat._id), strategy: verticalListSortingStrategy, children: _jsx("div", { className: "category-list", children: categories.map((category) => (_jsx(SortableCategoryItem, { category: category, onEdit: () => handleEditCategory(category._id) }, category._id))) }) })) })] }), _jsxs("div", { className: `category-preview-panel ${showPreview ? 'visible' : 'hidden'}`, children: [_jsx("button", { className: "preview-close-btn", onClick: () => setShowPreview(false), "aria-label": "Close Preview", children: _jsx(X, { size: 24 }) }), _jsx("div", { className: "phone-preview-container", children: _jsxs("div", { className: "phone-frame", children: [_jsx("div", { className: "phone-notch" }), _jsx("div", { className: "phone-content", children: _jsx(CategoryPreview, { categories: categories, loading: loading, saving: saving }) })] }) })] })] }) }), _jsx(CategoryModal, { isOpen: isModalOpen, onClose: handleModalClose, categoryId: editingCategoryId, onSuccess: handleModalSuccess })] }));
};
