import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/staff/CategoryModal.tsx
import { useState, useEffect } from 'react';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuService } from '@/modules/menu/services/menu.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { CategoryModalSkeleton } from './CategoryModalSkeleton';
import './CategoryModal.css';
export const CategoryModal = ({ isOpen, onClose, categoryId, onSuccess, }) => {
    const { staff, token } = useStaffAuth();
    const isEditMode = !!categoryId;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        scope: 'restaurant',
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    useEffect(() => {
        if (isOpen && isEditMode && categoryId && staff && token) {
            loadCategory();
        }
        else if (isOpen && !isEditMode) {
            // Reset form for add mode
            setFormData({
                name: '',
                description: '',
                image: '',
                scope: 'restaurant',
                isActive: true,
            });
            setErrors({});
        }
    }, [isOpen, isEditMode, categoryId, staff, token]);
    const loadCategory = async () => {
        if (!staff || !token || !categoryId)
            return;
        setLoadingData(true);
        try {
            const response = await MenuService.getCategory(token, staff.restaurantId, categoryId);
            if (response.success && response.data) {
                const category = response.data;
                setFormData({
                    name: category.name,
                    description: category.description || '',
                    image: category.image || '',
                    scope: category.scope,
                    isActive: category.isActive,
                });
            }
        }
        catch (err) {
            alert(err.message || 'Failed to load category');
            onClose();
        }
        finally {
            setLoadingData(false);
        }
    };
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = e.target.checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        }
        else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };
    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate() || !staff || !token)
            return;
        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                image: formData.image.trim() || undefined,
                scope: formData.scope,
                isActive: formData.isActive,
            };
            if (isEditMode && categoryId) {
                await MenuService.updateCategory(token, staff.restaurantId, categoryId, payload);
            }
            else {
                await MenuService.createCategory(token, staff.restaurantId, payload);
            }
            onSuccess();
            onClose();
        }
        catch (err) {
            alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
        }
        finally {
            setLoading(false);
        }
    };
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "category-modal-overlay", onClick: handleOverlayClick, children: _jsxs("div", { className: "category-modal-container", children: [_jsx("button", { className: "category-modal-close", onClick: onClose, disabled: loading || loadingData, children: _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", children: _jsx("path", { d: "M18 6L6 18M6 6L18 18", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }), loadingData ? (_jsx(CategoryModalSkeleton, {})) : (_jsxs("div", { className: "category-modal-content", children: [_jsxs("div", { className: "category-modal-form-side", children: [_jsxs("div", { className: "category-modal-header", children: [_jsx("h2", { className: "category-modal-title", children: isEditMode ? 'Edit Category' : 'Create New Category' }), _jsx("p", { className: "category-modal-subtitle", children: isEditMode ? 'Update category details' : 'Add a new category to your menu' })] }), _jsxs("form", { onSubmit: handleSubmit, className: "category-modal-form", children: [_jsx(InputField, { label: "Category Name", type: "text", name: "name", value: formData.name, error: errors.name, onChange: handleChange, disabled: loading, required: true, autoFocus: true, placeholder: "e.g., Appetizers, Main Course" }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Description ", _jsx("span", { className: "optional-label", children: "(Optional)" })] }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, disabled: loading, className: "form-textarea", rows: 3, placeholder: "Brief description of this category" })] }), _jsx(InputField, { label: "Image URL", type: "text", name: "image", value: formData.image, onChange: handleChange, disabled: loading, placeholder: "https://example.com/image.jpg (Optional)" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Scope" }), _jsxs("select", { name: "scope", value: formData.scope, onChange: handleChange, disabled: loading || isEditMode, className: "form-select", children: [_jsx("option", { value: "restaurant", children: "Restaurant-wide" }), _jsx("option", { value: "branch", children: "Branch-specific" })] }), isEditMode && (_jsx("p", { className: "field-help-text", children: "Scope cannot be changed after creation" }))] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", name: "isActive", checked: formData.isActive, onChange: handleChange, disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Category is active" })] }), _jsx("p", { className: "field-help-text", children: "Inactive categories won't be visible to customers" })] }), _jsxs("div", { className: "category-modal-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, children: isEditMode ? 'Update Category' : 'Create Category' })] })] })] }), _jsxs("div", { className: "category-modal-preview-side", children: [_jsx("div", { className: "preview-header", children: _jsx("h3", { className: "preview-title", children: "Live Preview" }) }), _jsx("div", { className: "category-preview-card-wrapper", children: _jsxs("div", { className: "category-preview-card-modal", children: [formData.image && (_jsx("div", { className: "preview-image-container", children: _jsx("img", { src: formData.image, alt: "Category preview", className: "preview-image", onError: (e) => {
                                                        e.target.style.display = 'none';
                                                    } }) })), _jsxs("div", { className: "preview-content", children: [_jsx("h4", { className: "preview-category-name", children: formData.name || 'Category Name' }), _jsx("p", { className: "preview-description", children: formData.description || 'Category description will appear here' }), _jsxs("div", { className: "preview-badges", children: [_jsx("span", { className: "preview-scope-badge", children: formData.scope === 'restaurant'
                                                                    ? '🏢 Restaurant-wide'
                                                                    : '🏪 Branch-specific' }), _jsx("span", { className: `preview-status-badge ${formData.isActive ? 'active' : 'inactive'}`, children: formData.isActive ? '● Active' : '○ Inactive' })] })] })] }) })] })] }))] }) }));
};
