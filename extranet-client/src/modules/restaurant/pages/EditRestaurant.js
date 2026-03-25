import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/restaurants/EditRestaurant.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { RestaurantService } from '@/modules/restaurant/services/restaurant.service';
import { Button } from '@/shared/components/Button';
import { InputField } from '@/shared/components/InputField';
import { updateThemeSchema, updateSubscriptionSchema, updateSettingsSchema, } from '@/shared/validations/restaurant.validation';
import './EditRestaurant.css';
export const EditRestaurant = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // Form states for different tabs
    const [generalData, setGeneralData] = useState({
        name: '',
        type: 'single',
        isActive: true,
    });
    const [themeData, setThemeData] = useState({
        primaryColor: '#3498db',
        secondaryColor: '#95a5a6',
        accentColor: '#e74c3c',
        logo: '',
        favicon: '',
        font: 'Roboto',
        bannerImage: '',
        customCSS: '',
    });
    const [subscriptionData, setSubscriptionData] = useState({
        plan: 'trial',
        isActive: true,
        maxBranches: 1,
    });
    const [settingsData, setSettingsData] = useState({
        currency: 'USD',
        serviceChargePercentage: 0,
        allowBranchOverride: false,
    });
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (id && token) {
            loadRestaurant();
        }
    }, [id, token]);
    const loadRestaurant = async () => {
        if (!id || !token)
            return;
        setLoading(true);
        setError('');
        try {
            const response = await RestaurantService.getRestaurant(token, id);
            if (response.success && response.data) {
                const r = response.data;
                setRestaurant(r);
                // Populate form data
                setGeneralData({
                    name: r.name,
                    type: r.type,
                    isActive: r.isActive,
                });
                setThemeData({
                    primaryColor: r.theme.primaryColor,
                    secondaryColor: r.theme.secondaryColor,
                    accentColor: r.theme.accentColor,
                    logo: r.theme.logo || '',
                    favicon: r.theme.favicon || '',
                    font: r.theme.font,
                    bannerImage: r.theme.bannerImage || '',
                    customCSS: r.theme.customCSS || '',
                });
                setSubscriptionData({
                    plan: r.subscription.plan,
                    isActive: r.subscription.isActive,
                    maxBranches: r.subscription.maxBranches,
                });
                setSettingsData({
                    currency: r.defaultSettings.currency,
                    serviceChargePercentage: r.defaultSettings.serviceChargePercentage,
                    allowBranchOverride: r.defaultSettings.allowBranchOverride ?? false,
                });
            }
            else {
                setError(response.message || 'Failed to load restaurant');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while loading the restaurant');
        }
        finally {
            setLoading(false);
        }
    };
    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
        setErrors({});
    };
    const handleSaveGeneral = async () => {
        if (!id || !token)
            return;
        clearMessages();
        setSaving(true);
        try {
            const response = await RestaurantService.updateRestaurant(token, id, generalData);
            if (response.success) {
                setSuccessMessage('General information updated successfully!');
                loadRestaurant(); // Refresh data
            }
            else {
                setError(response.message || 'Failed to update general information');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while saving');
        }
        finally {
            setSaving(false);
        }
    };
    const handleSaveTheme = async () => {
        if (!id || !token)
            return;
        clearMessages();
        const result = updateThemeSchema.safeParse(themeData);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                fieldErrors[path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        setSaving(true);
        try {
            const response = await RestaurantService.updateTheme(token, id, themeData);
            if (response.success) {
                setSuccessMessage('Theme updated successfully!');
                loadRestaurant();
            }
            else {
                setError(response.message || 'Failed to update theme');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while saving theme');
        }
        finally {
            setSaving(false);
        }
    };
    const handleSaveSubscription = async () => {
        if (!id || !token)
            return;
        clearMessages();
        const result = updateSubscriptionSchema.safeParse(subscriptionData);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                fieldErrors[path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        setSaving(true);
        try {
            const response = await RestaurantService.updateSubscription(token, id, subscriptionData);
            if (response.success) {
                setSuccessMessage('Subscription updated successfully!');
                loadRestaurant();
            }
            else {
                setError(response.message || 'Failed to update subscription');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while saving subscription');
        }
        finally {
            setSaving(false);
        }
    };
    const handleSaveSettings = async () => {
        if (!id || !token)
            return;
        clearMessages();
        const result = updateSettingsSchema.safeParse(settingsData);
        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                fieldErrors[path] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }
        setSaving(true);
        try {
            const response = await RestaurantService.updateSettings(token, id, settingsData);
            if (response.success) {
                setSuccessMessage('Default settings updated successfully!');
                loadRestaurant();
            }
            else {
                setError(response.message || 'Failed to update settings');
            }
        }
        catch (err) {
            setError(err.message || 'An error occurred while saving settings');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "edit-restaurant-container", children: _jsx("div", { className: "loading-state", children: "Loading restaurant details..." }) }));
    }
    if (error && !restaurant) {
        return (_jsx("div", { className: "edit-restaurant-container", children: _jsxs("div", { className: "error-state", children: [_jsx("h2", { children: "Error" }), _jsx("p", { children: error }), _jsx(Button, { variant: "outline", onClick: () => navigate('/restaurants'), children: "\u2190 Back to Restaurants" })] }) }));
    }
    return (_jsxs("div", { className: "edit-restaurant-container", children: [_jsxs("div", { className: "edit-restaurant-header", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-title", children: "Edit Restaurant" }), _jsx("p", { className: "page-subtitle", children: restaurant?.name || 'Loading...' })] }), _jsx("div", { className: "header-actions", children: _jsx(Button, { variant: "outline", onClick: () => navigate(`/restaurants/${id}`), children: "\u2190 View Restaurant" }) })] }), error && _jsx("div", { className: "error-banner", children: error }), successMessage && _jsx("div", { className: "success-banner", children: successMessage }), _jsxs("div", { className: "tabs-container", children: [_jsxs("div", { className: "tabs-header", children: [_jsx("button", { className: `tab ${activeTab === 'general' ? 'active' : ''}`, onClick: () => setActiveTab('general'), "data-testid": "general-tab", children: "General Info" }), _jsx("button", { className: `tab ${activeTab === 'theme' ? 'active' : ''}`, onClick: () => setActiveTab('theme'), "data-testid": "theme-tab", children: "Theme" }), _jsx("button", { className: `tab ${activeTab === 'subscription' ? 'active' : ''}`, onClick: () => setActiveTab('subscription'), "data-testid": "subscription-tab", children: "Subscription" }), _jsx("button", { className: `tab ${activeTab === 'settings' ? 'active' : ''}`, onClick: () => setActiveTab('settings'), "data-testid": "settings-tab", children: "Settings" })] }), _jsxs("div", { className: "tabs-content", children: [activeTab === 'general' && (_jsxs("div", { className: "tab-panel", children: [_jsx("h2", { className: "section-title", children: "General Information" }), _jsxs("div", { className: "form-grid", children: [_jsx(InputField, { label: "Restaurant Name", value: generalData.name, onChange: (e) => setGeneralData({ ...generalData, name: e.target.value }), disabled: saving, "data-testid": "general-name-input" }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Restaurant Type" }), _jsxs("select", { value: generalData.type, onChange: (e) => setGeneralData({
                                                            ...generalData,
                                                            type: e.target.value,
                                                        }), className: "select-input", disabled: saving, "data-testid": "general-type-select", children: [_jsx("option", { value: "single", children: "Single Location" }), _jsx("option", { value: "chain", children: "Chain (Multiple Locations)" })] })] }), _jsx("div", { className: "form-field checkbox-field", children: _jsxs("label", { className: "field-label", children: [_jsx("input", { type: "checkbox", checked: generalData.isActive, onChange: (e) => setGeneralData({ ...generalData, isActive: e.target.checked }), disabled: saving, "data-testid": "general-active-checkbox" }), _jsx("span", { children: "Restaurant is Active" })] }) })] }), _jsx("div", { className: "form-actions", children: _jsx(Button, { variant: "primary", onClick: handleSaveGeneral, loading: saving, "data-testid": "save-general-button", children: "Save General Info" }) })] })), activeTab === 'theme' && (_jsxs("div", { className: "tab-panel", children: [_jsx("h2", { className: "section-title", children: "Theme Settings" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Primary Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: themeData.primaryColor, onChange: (e) => setThemeData({ ...themeData, primaryColor: e.target.value }), className: "color-picker", disabled: saving }), _jsx(InputField, { value: themeData.primaryColor.toUpperCase(), onChange: (e) => setThemeData({ ...themeData, primaryColor: e.target.value }), error: errors['primaryColor'], disabled: saving, placeholder: "#3498DB", "data-testid": "theme-primary-color-input" })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Secondary Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: themeData.secondaryColor, onChange: (e) => setThemeData({ ...themeData, secondaryColor: e.target.value }), className: "color-picker", disabled: saving }), _jsx(InputField, { value: themeData.secondaryColor.toUpperCase(), onChange: (e) => setThemeData({ ...themeData, secondaryColor: e.target.value }), error: errors['secondaryColor'], disabled: saving, placeholder: "#95A5A6", "data-testid": "theme-secondary-color-input" })] })] }), _jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Accent Color" }), _jsxs("div", { className: "color-input-group", children: [_jsx("input", { type: "color", value: themeData.accentColor, onChange: (e) => setThemeData({ ...themeData, accentColor: e.target.value }), className: "color-picker", disabled: saving }), _jsx(InputField, { value: themeData.accentColor.toUpperCase(), onChange: (e) => setThemeData({ ...themeData, accentColor: e.target.value }), error: errors['accentColor'], disabled: saving, placeholder: "#E74C3C", "data-testid": "theme-accent-color-input" })] })] }), _jsx(InputField, { label: "Font Family", value: themeData.font, onChange: (e) => setThemeData({ ...themeData, font: e.target.value }), disabled: saving, placeholder: "e.g. Roboto, Arial", "data-testid": "theme-font-input" }), _jsx(InputField, { label: "Logo URL", value: themeData.logo, onChange: (e) => setThemeData({ ...themeData, logo: e.target.value }), error: errors['logo'], disabled: saving, placeholder: "https://example.com/logo.png", "data-testid": "theme-logo-input" }), _jsx(InputField, { label: "Favicon URL", value: themeData.favicon, onChange: (e) => setThemeData({ ...themeData, favicon: e.target.value }), error: errors['favicon'], disabled: saving, placeholder: "https://example.com/favicon.ico", "data-testid": "theme-favicon-input" }), _jsx(InputField, { label: "Banner Image URL", value: themeData.bannerImage, onChange: (e) => setThemeData({ ...themeData, bannerImage: e.target.value }), error: errors['bannerImage'], disabled: saving, placeholder: "https://example.com/banner.jpg", "data-testid": "theme-banner-input" }), _jsxs("div", { className: "form-field full-width", children: [_jsx("label", { className: "field-label", children: "Custom CSS" }), _jsx("textarea", { value: themeData.customCSS, onChange: (e) => setThemeData({ ...themeData, customCSS: e.target.value }), className: "textarea-input", rows: 8, disabled: saving, placeholder: "/* Add your custom styles here */\\nbody { background: #f0f0f0; }", "data-testid": "theme-custom-css-textarea" })] })] }), _jsx("div", { className: "form-actions", children: _jsx(Button, { variant: "primary", onClick: handleSaveTheme, loading: saving, "data-testid": "save-theme-button", children: "Save Theme" }) })] })), activeTab === 'subscription' && (_jsxs("div", { className: "tab-panel", children: [_jsx("h2", { className: "section-title", children: "Subscription Details" }), _jsxs("div", { className: "form-grid", children: [_jsxs("div", { className: "form-field", children: [_jsx("label", { className: "field-label", children: "Subscription Plan" }), _jsxs("select", { value: subscriptionData.plan, onChange: (e) => setSubscriptionData({
                                                            ...subscriptionData,
                                                            plan: e.target.value,
                                                        }), className: "select-input", disabled: saving, "data-testid": "subscription-plan-select", children: [_jsx("option", { value: "trial", children: "Trial (30 days)" }), _jsx("option", { value: "basic", children: "Basic" }), _jsx("option", { value: "premium", children: "Premium" }), _jsx("option", { value: "enterprise", children: "Enterprise" })] })] }), _jsx(InputField, { label: "Maximum Branches", type: "number", value: subscriptionData.maxBranches, onChange: (e) => setSubscriptionData({
                                                    ...subscriptionData,
                                                    maxBranches: parseInt(e.target.value) || 1,
                                                }), error: errors['maxBranches'], disabled: saving, min: "1", "data-testid": "subscription-max-branches-input" }), _jsx("div", { className: "form-field checkbox-field", children: _jsxs("label", { className: "field-label", children: [_jsx("input", { type: "checkbox", checked: subscriptionData.isActive, onChange: (e) => setSubscriptionData({
                                                                ...subscriptionData,
                                                                isActive: e.target.checked,
                                                            }), disabled: saving, "data-testid": "subscription-active-checkbox" }), _jsx("span", { children: "Subscription is Active" })] }) })] }), _jsx("div", { className: "form-actions", children: _jsx(Button, { variant: "primary", onClick: handleSaveSubscription, loading: saving, "data-testid": "save-subscription-button", children: "Save Subscription" }) })] })), activeTab === 'settings' && (_jsxs("div", { className: "tab-panel", children: [_jsx("h2", { className: "section-title", children: "Default Settings" }), _jsxs("div", { className: "form-grid", children: [_jsx(InputField, { label: "Currency", value: settingsData.currency, onChange: (e) => setSettingsData({ ...settingsData, currency: e.target.value.toUpperCase() }), error: errors['currency'], disabled: saving, placeholder: "USD", "data-testid": "settings-currency-input" }), _jsx(InputField, { label: "Service Charge (%)", type: "number", value: settingsData.serviceChargePercentage, onChange: (e) => setSettingsData({
                                                    ...settingsData,
                                                    serviceChargePercentage: parseFloat(e.target.value) || 0,
                                                }), error: errors['serviceChargePercentage'], disabled: saving, min: "0", max: "100", step: "0.5", "data-testid": "settings-service-charge-input" }), _jsx("div", { className: "form-field checkbox-field", children: _jsxs("label", { className: "field-label", children: [_jsx("input", { type: "checkbox", checked: settingsData.allowBranchOverride, onChange: (e) => setSettingsData({
                                                                ...settingsData,
                                                                allowBranchOverride: e.target.checked,
                                                            }), disabled: saving, "data-testid": "settings-allow-override-checkbox" }), _jsx("span", { children: "Allow Branches to Override Settings" })] }) })] }), _jsx("div", { className: "form-actions", children: _jsx(Button, { variant: "primary", onClick: handleSaveSettings, loading: saving, "data-testid": "save-settings-button", children: "Save Settings" }) })] }))] })] })] }));
};
