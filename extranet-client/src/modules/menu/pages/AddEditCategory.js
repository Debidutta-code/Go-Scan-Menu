import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/staff/AddEditCategory.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuService } from '@/modules/menu/services/menu.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import './AddEditCategory.css';
export const AddEditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { staff, token } = useStaffAuth();
    const isEditMode = !!id;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        scope: 'restaurant',
        isActive: true,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    useEffect(() => {
        if (isEditMode && staff && token && id) {
            loadCategory();
        }
    }, [isEditMode, staff, token, id]);
    const loadCategory = async () => {
        if (!staff || !token || !id)
            return;
        setLoadingData(true);
        try {
            const response = await MenuService.getCategory(token, staff.restaurantId, id);
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
            navigate('/staff/categories');
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
        // Clear error for this field
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
            if (isEditMode && id) {
                await MenuService.updateCategory(token, staff.restaurantId, id, payload);
                alert('Category updated successfully!');
            }
            else {
                await MenuService.createCategory(token, staff.restaurantId, payload);
                alert('Category created successfully!');
            }
            navigate('/staff/categories');
        }
        catch (err) {
            alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} category`);
        }
        finally {
            setLoading(false);
        }
    };
    if (loadingData) {
        return (_jsx("div", { className: "add-edit-category-container", children: _jsx("div", { className: "loading-state", children: "Loading category..." }) }));
    }
    return (_jsxs("div", { className: "add-edit-category-split-container", children: [_jsx("div", { className: "category-form-side", children: _jsxs("div", { className: "category-form-card", children: [_jsxs("div", { className: "form-header", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/staff/categories'), disabled: loading, children: "\u2190 Back" }), _jsx("h1", { className: "form-title", "data-testid": "form-title", children: isEditMode ? 'Edit Category' : 'Add New Category' }), _jsx("p", { className: "form-subtitle", children: "Enter the category details below" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "category-form", children: [_jsx(InputField, { label: "Category Name", type: "text", name: "name", value: formData.name, error: errors.name, onChange: handleChange, disabled: loading, required: true, autoFocus: true }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Description ", _jsx("span", { className: "optional-label", children: "(Optional)" })] }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, disabled: loading, className: "form-textarea", rows: 4, placeholder: "Brief description of this category" })] }), _jsx(InputField, { label: "Image URL", type: "text", name: "image", value: formData.image, onChange: handleChange, disabled: loading, placeholder: "https://example.com/image.jpg (Optional)" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Scope" }), _jsxs("select", { name: "scope", value: formData.scope, onChange: handleChange, disabled: loading || isEditMode, className: "form-select", children: [_jsx("option", { value: "restaurant", children: "Restaurant-wide" }), _jsx("option", { value: "branch", children: "Branch-specific" })] }), isEditMode && (_jsx("p", { className: "field-help-text", children: "Scope cannot be changed after creation" }))] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", name: "isActive", checked: formData.isActive, onChange: handleChange, disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Category is active" })] }), _jsx("p", { className: "field-help-text", children: "Inactive categories won't be visible to customers" })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/staff/categories'), disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, "data-testid": "submit-button", children: isEditMode ? 'Update Category' : 'Create Category' })] })] })] }) }), _jsx("div", { className: "category-preview-side", children: _jsxs("div", { className: "preview-card", children: [_jsx("h3", { className: "preview-title", children: "Preview" }), _jsxs("div", { className: "category-preview", children: [formData.image && (_jsx("div", { className: "preview-image-container", children: _jsx("img", { src: formData.image, alt: "Category preview", className: "preview-image", onError: (e) => {
                                            e.target.style.display = 'none';
                                        } }) })), _jsxs("div", { className: "preview-content", children: [_jsx("h4", { className: "preview-category-name", children: formData.name || 'Category Name' }), _jsx("p", { className: "preview-description", children: formData.description || 'Category description will appear here' }), _jsx("span", { className: "preview-scope-badge", children: formData.scope === 'restaurant' ? '🏢 Restaurant-wide' : '🏪 Branch-specific' })] })] })] }) })] }));
};
