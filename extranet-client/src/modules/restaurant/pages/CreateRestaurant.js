import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/restaurants/CreateRestaurant.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { createRestaurantSchema } from '@/shared/validations/restaurant.validation';
import './CreateRestaurant.css';
export const CreateRestaurant = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'single',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerPassword: '',
        plan: 'trial',
        maxBranches: 1,
        primaryColor: '#3498db',
        secondaryColor: '#95a5a6',
        accentColor: '#e74c3c',
        font: 'Roboto',
        currency: 'USD',
        serviceChargePercentage: 0,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    const handleSlugGenerate = () => {
        const slug = formData.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
        setFormData((prev) => ({ ...prev, slug }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setGeneralError('Authentication token not found');
            return;
        }
        setGeneralError('');
        setErrors({});
        // Prepare data for validation
        const dataToValidate = {
            name: formData.name,
            slug: formData.slug,
            type: formData.type,
            owner: {
                name: formData.ownerName,
                email: formData.ownerEmail,
                phone: formData.ownerPhone,
                password: formData.ownerPassword,
            },
            subscription: {
                plan: formData.plan,
                maxBranches: formData.maxBranches,
            },
            theme: {
                primaryColor: formData.primaryColor,
                secondaryColor: formData.secondaryColor,
                accentColor: formData.accentColor,
                font: formData.font,
            },
            defaultSettings: {
                currency: formData.currency,
                serviceChargePercentage: formData.serviceChargePercentage,
            },
        };
        // Validate with Zod
        const result = createRestaurantSchema.safeParse(dataToValidate);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                fieldErrors[path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        setLoading(true);
        try {
            const response = await RestaurantService.createRestaurant(token, dataToValidate);
            if (response.success) {
                alert('Restaurant created successfully!');
                navigate('/restaurants');
            }
            else {
                setGeneralError(response.message || 'Failed to create restaurant');
            }
        }
        catch (err) {
            setGeneralError(err.message || 'An error occurred while creating the restaurant');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "create-restaurant-container", children: [_jsxs("div", { className: "create-restaurant-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Create New Restaurant" }), _jsx("p", { className: "page-subtitle", children: "Fill in the details to create a new restaurant account" })] }), _jsx(Button, { variant: "outline", onClick: () => navigate('/restaurants'), children: "\u2190 Back to List" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "create-restaurant-form", children: [generalError && (_jsx("div", { className: "error-banner", "data-testid": "error-banner", children: generalError })), _jsxs("div", { className: "form-section", children: [_jsx("h2", { className: "section-title", children: "Restaurant Information" }), _jsxs("div", { className: "form-grid", children: [_jsx(InputField, { label: "Restaurant Name", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), error: errors['name'], disabled: loading, "data-testid": "restaurant-name-input", required: true }), _jsxs("div", { className: "slug-field-group", children: [_jsx(InputField, { label: "Slug (URL identifier)", value: formData.slug, onChange: (e) => handleInputChange('slug', e.target.value), error: errors['slug'], disabled: loading, "data-testid": "restaurant-slug-input", placeholder: "e.g. my-awesome-restaurant", required: true }), _jsx("button", { type: "button", className: "btn-generate-slug", onClick: handleSlugGenerate, disabled: loading || !formData.name.trim(), "data-testid": "generate-slug-button", children: "Generate from Name" })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Restaurant Type" }), _jsxs("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), className: "select-input", disabled: loading, "data-testid": "restaurant-type-select", children: [_jsx("option", { value: "single", children: "Single Location" }), _jsx("option", { value: "chain", children: "Chain (Multiple Locations)" })] }), errors['type'] && _jsx("span", { className: "field-error", children: errors['type'] })] })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h2", { className: "section-title", children: "Owner Information" }), _jsxs("div", { className: "form-grid", children: [_jsx(InputField, { label: "Owner Full Name", value: formData.ownerName, onChange: (e) => handleInputChange('ownerName', e.target.value), error: errors['owner.name'], disabled: loading, "data-testid": "owner-name-input", required: true }), _jsx(InputField, { label: "Owner Email", type: "email", value: formData.ownerEmail, onChange: (e) => handleInputChange('ownerEmail', e.target.value), error: errors['owner.email'], disabled: loading, "data-testid": "owner-email-input", required: true }), _jsx(InputField, { label: "Owner Phone", type: "tel", value: formData.ownerPhone, onChange: (e) => handleInputChange('ownerPhone', e.target.value), error: errors['owner.phone'], disabled: loading, "data-testid": "owner-phone-input" }), _jsx(InputField, { label: "Owner Password", type: "password", value: formData.ownerPassword, onChange: (e) => handleInputChange('ownerPassword', e.target.value), error: errors['owner.password'], disabled: loading, "data-testid": "owner-password-input", required: true })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h2", { className: "section-title", children: "Subscription Details" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Subscription Plan" }), _jsxs("select", { value: formData.plan, onChange: (e) => handleInputChange('plan', e.target.value), className: "select-input", disabled: loading, "data-testid": "subscription-plan-select", children: [_jsx("option", { value: "trial", children: "Trial (30 days)" }), _jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "premium", children: "Premium" }), _jsx("option", { value: "enterprise", children: "Enterprise" })] })] }), _jsx(InputField, { label: "Maximum Branches", type: "number", value: formData.maxBranches, onChange: (e) => handleInputChange('maxBranches', parseInt(e.target.value) || 1), error: errors['subscription.maxBranches'], disabled: loading, min: "1", "data-testid": "max-branches-input" })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h2", { className: "section-title", children: "Theme Settings" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Primary Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: formData.primaryColor, onChange: (e) => handleInputChange('primaryColor', e.target.value), className: "color-picker", disabled: loading }), _jsx(InputField, { value: formData.primaryColor.toUpperCase(), onChange: (e) => handleInputChange('primaryColor', e.target.value), disabled: loading, placeholder: "#3498db", "data-testid": "primary-color-input" })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Secondary Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: formData.secondaryColor, onChange: (e) => handleInputChange('secondaryColor', e.target.value), className: "color-picker", disabled: loading }), _jsx(InputField, { value: formData.secondaryColor.toUpperCase(), onChange: (e) => handleInputChange('secondaryColor', e.target.value), disabled: loading, placeholder: "#95a5a6", "data-testid": "secondary-color-input" })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Accent Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: formData.accentColor, onChange: (e) => handleInputChange('accentColor', e.target.value), className: "color-picker", disabled: loading }), _jsx(InputField, { value: formData.accentColor.toUpperCase(), onChange: (e) => handleInputChange('accentColor', e.target.value), disabled: loading, placeholder: "#e74c3c", "data-testid": "accent-color-input" })] })] }), _jsx(InputField, { label: "Font Family", value: formData.font, onChange: (e) => handleInputChange('font', e.target.value), disabled: loading, placeholder: "e.g. Roboto, Arial", "data-testid": "font-input" })] })] }), _jsxs("div", { className: "form-section", children: [_jsx("h2", { className: "section-title", children: "Default Settings" }), _jsxs("div", { className: "form-grid", children: [_jsx(InputField, { label: "Currency", value: formData.currency, onChange: (e) => handleInputChange('currency', e.target.value.toUpperCase()), disabled: loading, placeholder: "USD", "data-testid": "currency-input" }), _jsx(InputField, { label: "Service Charge (%)", type: "number", value: formData.serviceChargePercentage, onChange: (e) => handleInputChange('serviceChargePercentage', parseFloat(e.target.value) || 0), disabled: loading, min: "0", max: "100", step: "0.5", "data-testid": "service-charge-input" })] })] }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/restaurants'), disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, "data-testid": "submit-button", children: "Create Restaurant" })] })] })] }));
};
