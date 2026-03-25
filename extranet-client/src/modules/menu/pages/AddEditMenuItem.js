import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuAPI } from '@/modules/menu/pages/api/menu-api';
import { validateMenuItem } from '@/modules/menu/pages/utils/validation';
import { DietaryType, NutritionTag, Allergen, DrinkTemperature, DrinkAlcoholContent, DrinkCaffeineContent, DietaryTypeLabels, DietaryTypeIcons, AllergenLabels, NutritionTagLabels, DrinkTemperatureLabels, DrinkAlcoholContentLabels, DrinkCaffeineContentLabels } from '@/shared/types/menu.types';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { MenuPreview } from '@/modules/menu/pages/components/MenuPreview/MenuPreview';
import './AddEditMenuItem.css';
export const AddEditMenuItem = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { staff, token } = useStaffAuth();
    const isEditMode = !!id;
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        image: '',
        images: '',
        price: '',
        discountPrice: '',
        preparationTime: '',
        calories: '',
        spiceLevel: '',
        tags: '',
        itemType: 'food',
        dietaryType: '',
        drinkTemperature: '',
        drinkAlcoholContent: '',
        drinkCaffeineContent: '',
        scope: 'restaurant',
        isAvailable: true,
        availableQuantity: '',
        isActive: true,
        displayOrder: '0',
    });
    const [selectedAllergens, setSelectedAllergens] = useState([]);
    const [selectedNutritionTags, setSelectedNutritionTags] = useState([]);
    const [variants, setVariants] = useState([]);
    const [addons, setAddons] = useState([]);
    const [customizations, setCustomizations] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    useEffect(() => {
        if (staff && token) {
            loadInitialData();
        }
    }, [staff, token]);
    const loadInitialData = async () => {
        if (!staff || !token)
            return;
        setLoadingData(true);
        try {
            const categoriesData = await MenuAPI.getCategories(token, staff.restaurantId);
            setCategories(categoriesData);
            if (isEditMode && id) {
                const item = await MenuAPI.getMenuItem(token, staff.restaurantId, id);
                if (item) {
                    setFormData({
                        name: item.name,
                        description: item.description || '',
                        categoryId: item.categoryId,
                        image: item.image || '',
                        images: item.images?.join(', ') || '',
                        price: item.price.toString(),
                        discountPrice: item.discountPrice?.toString() || '',
                        preparationTime: item.preparationTime?.toString() || '',
                        calories: item.calories?.toString() || '',
                        spiceLevel: item.spiceLevel || '',
                        tags: item.tags?.join(', ') || '',
                        itemType: item.itemType || 'food',
                        dietaryType: item.dietaryType || '',
                        drinkTemperature: item.drinkTemperature || '',
                        drinkAlcoholContent: item.drinkAlcoholContent || '',
                        drinkCaffeineContent: item.drinkCaffeineContent || '',
                        scope: item.scope,
                        isAvailable: item.isAvailable,
                        availableQuantity: item.availableQuantity?.toString() || '',
                        isActive: item.isActive,
                        displayOrder: item.displayOrder?.toString() || '0',
                    });
                    if (item.allergens && Array.isArray(item.allergens)) {
                        setSelectedAllergens(item.allergens);
                    }
                    if (item.nutritionTags && Array.isArray(item.nutritionTags)) {
                        setSelectedNutritionTags(item.nutritionTags);
                    }
                    if (item.variants && item.variants.length > 0) {
                        setVariants(item.variants.map(v => ({
                            name: v.name,
                            price: v.price.toString(),
                            isDefault: v.isDefault
                        })));
                    }
                    if (item.addons && item.addons.length > 0) {
                        setAddons(item.addons.map(a => ({
                            name: a.name,
                            price: a.price.toString()
                        })));
                    }
                    if (item.customizations && item.customizations.length > 0) {
                        setCustomizations(item.customizations.map(c => ({
                            name: c.name,
                            options: c.options.join(', '),
                            isRequired: c.isRequired
                        })));
                    }
                }
            }
        }
        catch (err) {
            alert(err.message || 'Failed to load data');
            if (isEditMode) {
                navigate('/staff/menu');
            }
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
    const handleDietaryTypeSelect = (type) => {
        setFormData((prev) => ({ ...prev, dietaryType: type }));
        if (errors.dietaryType) {
            setErrors((prev) => ({ ...prev, dietaryType: '' }));
        }
    };
    const handleDrinkTemperatureSelect = (temp) => {
        setFormData((prev) => ({ ...prev, drinkTemperature: temp }));
    };
    const handleDrinkAlcoholSelect = (alcohol) => {
        setFormData((prev) => ({ ...prev, drinkAlcoholContent: alcohol }));
    };
    const handleDrinkCaffeineSelect = (caffeine) => {
        setFormData((prev) => ({ ...prev, drinkCaffeineContent: caffeine }));
    };
    const handleAllergenToggle = (allergen) => {
        setSelectedAllergens((prev) => prev.includes(allergen)
            ? prev.filter((a) => a !== allergen)
            : [...prev, allergen]);
    };
    const handleNutritionTagToggle = (tag) => {
        setSelectedNutritionTags((prev) => prev.includes(tag)
            ? prev.filter((t) => t !== tag)
            : [...prev, tag]);
    };
    const addVariant = () => {
        setVariants([...variants, { name: '', price: '', isDefault: false }]);
    };
    const updateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };
    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };
    const addAddon = () => {
        setAddons([...addons, { name: '', price: '' }]);
    };
    const updateAddon = (index, field, value) => {
        const updated = [...addons];
        updated[index] = { ...updated[index], [field]: value };
        setAddons(updated);
    };
    const removeAddon = (index) => {
        setAddons(addons.filter((_, i) => i !== index));
    };
    const addCustomization = () => {
        setCustomizations([...customizations, { name: '', options: '', isRequired: false }]);
    };
    const updateCustomization = (index, field, value) => {
        const updated = [...customizations];
        updated[index] = { ...updated[index], [field]: value };
        setCustomizations(updated);
    };
    const removeCustomization = (index) => {
        setCustomizations(customizations.filter((_, i) => i !== index));
    };
    const validate = () => {
        const newErrors = validateMenuItem(formData);
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
                categoryId: formData.categoryId,
                image: formData.image.trim() || undefined,
                images: formData.images ? formData.images.split(',').map((img) => img.trim()).filter(Boolean) : [],
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
                preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
                calories: formData.calories ? parseInt(formData.calories) : undefined,
                spiceLevel: formData.spiceLevel || undefined,
                tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                allergens: selectedAllergens,
                nutritionTags: selectedNutritionTags,
                itemType: formData.itemType,
                dietaryType: formData.itemType === 'food' ? formData.dietaryType || undefined : undefined,
                drinkTemperature: formData.itemType === 'drink' ? formData.drinkTemperature || undefined : undefined,
                drinkAlcoholContent: formData.itemType === 'drink' ? formData.drinkAlcoholContent || undefined : undefined,
                drinkCaffeineContent: formData.itemType === 'drink' ? formData.drinkCaffeineContent || undefined : undefined,
                scope: formData.scope,
                isAvailable: formData.isAvailable,
                availableQuantity: formData.availableQuantity ? parseInt(formData.availableQuantity) : undefined,
                isActive: formData.isActive,
                displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : 0,
                variants: variants.filter(v => v.name && v.price).map(v => ({
                    name: v.name,
                    price: parseFloat(v.price),
                    isDefault: v.isDefault
                })),
                addons: addons.filter(a => a.name && a.price).map(a => ({
                    name: a.name,
                    price: parseFloat(a.price)
                })),
                customizations: customizations.filter(c => c.name && c.options).map(c => ({
                    name: c.name,
                    options: c.options.split(',').map((o) => o.trim()).filter(Boolean),
                    isRequired: c.isRequired
                })),
            };
            if (isEditMode && id) {
                await MenuAPI.updateMenuItem(token, staff.restaurantId, id, payload);
                alert('Menu item updated successfully!');
            }
            else {
                await MenuAPI.createMenuItem(token, staff.restaurantId, payload);
                alert('Menu item created successfully!');
            }
            navigate('/staff/menu');
        }
        catch (err) {
            alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} menu item`);
        }
        finally {
            setLoading(false);
        }
    };
    if (loadingData) {
        return (_jsx("div", { className: "add-edit-menuitem-container", children: _jsx("div", { className: "loading-state", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "add-edit-menuitem-split-container", children: [_jsx("div", { className: "menuitem-form-side", children: _jsxs("div", { className: "menuitem-form-card", children: [_jsxs("div", { className: "form-header", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/staff/menu'), disabled: loading, children: "\u2190 Back" }), _jsx("h1", { className: "form-title", "data-testid": "form-title", children: isEditMode ? 'Edit Menu Item' : 'Add New Menu Item' }), _jsx("p", { className: "form-subtitle", children: "Enter the menu item details below" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "menuitem-form", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Item Type ", _jsx("span", { className: "required-label", children: "*" })] }), _jsxs("div", { className: "radio-card-group", children: [_jsxs("label", { className: `radio-card ${formData.itemType === 'food' ? 'selected' : ''}`, children: [_jsx("input", { type: "radio", name: "itemType", value: "food", checked: formData.itemType === 'food', onChange: handleChange, disabled: loading || isEditMode, className: "radio-card-input" }), _jsxs("div", { className: "radio-card-content", children: [_jsx("span", { className: "radio-card-icon", children: "\uD83C\uDF7D\uFE0F" }), _jsx("span", { className: "radio-card-label", children: "Food" })] })] }), _jsxs("label", { className: `radio-card ${formData.itemType === 'drink' ? 'selected' : ''}`, children: [_jsx("input", { type: "radio", name: "itemType", value: "drink", checked: formData.itemType === 'drink', onChange: handleChange, disabled: loading || isEditMode, className: "radio-card-input" }), _jsxs("div", { className: "radio-card-content", children: [_jsx("span", { className: "radio-card-icon", children: "\uD83E\uDD64" }), _jsx("span", { className: "radio-card-label", children: "Drink" })] })] })] }), isEditMode && (_jsx("p", { className: "field-help-text", children: "Item type cannot be changed after creation" }))] }), _jsx(InputField, { label: "Item Name", type: "text", name: "name", value: formData.name, error: errors.name, onChange: handleChange, disabled: loading, required: true, autoFocus: true }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Category ", _jsx("span", { className: "required-label", children: "*" })] }), _jsxs("select", { name: "categoryId", value: formData.categoryId, onChange: handleChange, disabled: loading, className: `form-select ${errors.categoryId ? 'error' : ''}`, required: true, children: [_jsx("option", { value: "", children: "Select a category" }), categories.map((category) => (_jsx("option", { value: category._id, children: category.name }, category._id)))] }), errors.categoryId && _jsx("span", { className: "error-text", children: errors.categoryId })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Description ", _jsx("span", { className: "optional-label", children: "(Optional)" })] }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, disabled: loading, className: "form-textarea", rows: 3, placeholder: "Brief description of this menu item" })] }), formData.itemType === 'food' && (_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Dietary Type ", _jsx("span", { className: "required-label", children: "*" })] }), _jsx("div", { className: "selection-card-grid", children: Object.values(DietaryType).map((type) => (_jsxs("button", { type: "button", onClick: () => handleDietaryTypeSelect(type), disabled: loading, className: `selection-card ${formData.dietaryType === type ? 'selected' : ''} ${errors.dietaryType ? 'error' : ''}`, children: [_jsx("span", { className: "selection-card-icon", children: DietaryTypeIcons[type] }), _jsx("span", { className: "selection-card-label", children: DietaryTypeLabels[type] })] }, type))) }), errors.dietaryType && _jsx("span", { className: "error-text", children: errors.dietaryType })] })), formData.itemType === 'drink' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Temperature (Optional)" }), _jsx("div", { className: "selection-card-grid two-column", children: Object.values(DrinkTemperature).map((temp) => (_jsxs("button", { type: "button", onClick: () => handleDrinkTemperatureSelect(temp), disabled: loading, className: `selection-card ${formData.drinkTemperature === temp ? 'selected' : ''}`, children: [_jsx("span", { className: "selection-card-icon", children: temp === DrinkTemperature.HOT ? '🔥' : '❄️' }), _jsx("span", { className: "selection-card-label", children: DrinkTemperatureLabels[temp] })] }, temp))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Alcohol Content (Optional)" }), _jsx("div", { className: "selection-card-grid two-column", children: Object.values(DrinkAlcoholContent).map((alcohol) => (_jsxs("button", { type: "button", onClick: () => handleDrinkAlcoholSelect(alcohol), disabled: loading, className: `selection-card ${formData.drinkAlcoholContent === alcohol ? 'selected' : ''}`, children: [_jsx("span", { className: "selection-card-icon", children: alcohol === DrinkAlcoholContent.ALCOHOLIC ? '🍺' : '🚫' }), _jsx("span", { className: "selection-card-label", children: DrinkAlcoholContentLabels[alcohol] })] }, alcohol))) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Caffeine Content (Optional)" }), _jsx("div", { className: "selection-card-grid two-column", children: Object.values(DrinkCaffeineContent).map((caffeine) => (_jsxs("button", { type: "button", onClick: () => handleDrinkCaffeineSelect(caffeine), disabled: loading, className: `selection-card ${formData.drinkCaffeineContent === caffeine ? 'selected' : ''}`, children: [_jsx("span", { className: "selection-card-icon", children: caffeine === DrinkCaffeineContent.CAFFEINATED ? '⚡' : '😴' }), _jsx("span", { className: "selection-card-label", children: DrinkCaffeineContentLabels[caffeine] })] }, caffeine))) })] })] })), _jsx(InputField, { label: "Image URL", type: "text", name: "image", value: formData.image, onChange: handleChange, disabled: loading, placeholder: "https://example.com/image.jpg (Optional)" }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: ["Additional Images ", _jsx("span", { className: "optional-label", children: "(Optional, comma-separated URLs)" })] }), _jsx("input", { type: "text", name: "images", value: formData.images, onChange: handleChange, disabled: loading, className: "form-input", placeholder: "https://example.com/image1.jpg, https://example.com/image2.jpg" }), _jsx("p", { className: "field-help-text", children: "Multiple images for gallery view" })] }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Price", type: "number", name: "price", value: formData.price, error: errors.price, onChange: handleChange, disabled: loading, required: true, step: "0.01", min: "0" }), _jsx(InputField, { label: "Discount Price (Optional)", type: "number", name: "discountPrice", value: formData.discountPrice, error: errors.discountPrice, onChange: handleChange, disabled: loading, step: "0.01", min: "0" })] }), _jsxs("div", { className: "form-row", children: [_jsx(InputField, { label: "Prep Time (mins)", type: "number", name: "preparationTime", value: formData.preparationTime, onChange: handleChange, disabled: loading, min: "0" }), _jsx(InputField, { label: "Calories", type: "number", name: "calories", value: formData.calories, onChange: handleChange, disabled: loading, min: "0", placeholder: "Optional" })] }), formData.itemType === 'food' && (_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Spice Level" }), _jsxs("select", { name: "spiceLevel", value: formData.spiceLevel, onChange: handleChange, disabled: loading, className: "form-select", children: [_jsx("option", { value: "", children: "None" }), _jsx("option", { value: "mild", children: "Mild" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "hot", children: "Hot" }), _jsx("option", { value: "extra_hot", children: "Extra Hot" })] })] }), _jsx(InputField, { label: "Available Quantity", type: "number", name: "availableQuantity", value: formData.availableQuantity, onChange: handleChange, disabled: loading, min: "0", placeholder: "Optional (leave empty for unlimited)" })] })), formData.itemType === 'drink' && (_jsx(InputField, { label: "Available Quantity", type: "number", name: "availableQuantity", value: formData.availableQuantity, onChange: handleChange, disabled: loading, min: "0", placeholder: "Optional (leave empty for unlimited)" })), _jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Allergens (Optional)" }), _jsx("p", { className: "field-help-text", children: "Select all allergens present in this item" }), _jsx("div", { className: "checkbox-card-grid", children: Object.values(Allergen).map((allergen) => (_jsxs("label", { className: `checkbox-card ${selectedAllergens.includes(allergen) ? 'selected' : ''}`, children: [_jsx("input", { type: "checkbox", checked: selectedAllergens.includes(allergen), onChange: () => handleAllergenToggle(allergen), disabled: loading, className: "checkbox-card-input" }), _jsxs("div", { className: "checkbox-card-content", children: [_jsx("span", { className: "checkbox-card-check", children: "\u2713" }), _jsx("span", { className: "checkbox-card-label", children: AllergenLabels[allergen] })] })] }, allergen))) })] }), _jsxs("div", { className: "form-section", children: [_jsx("h3", { className: "section-title", children: "Nutrition Tags (Optional)" }), _jsx("p", { className: "field-help-text", children: "Select applicable nutrition tags" }), _jsx("div", { className: "checkbox-card-grid", children: Object.values(NutritionTag).map((tag) => (_jsxs("label", { className: `checkbox-card ${selectedNutritionTags.includes(tag) ? 'selected' : ''}`, children: [_jsx("input", { type: "checkbox", checked: selectedNutritionTags.includes(tag), onChange: () => handleNutritionTagToggle(tag), disabled: loading, className: "checkbox-card-input" }), _jsxs("div", { className: "checkbox-card-content", children: [_jsx("span", { className: "checkbox-card-check", children: "\u2713" }), _jsx("span", { className: "checkbox-card-label", children: NutritionTagLabels[tag] })] })] }, tag))) })] }), _jsx(InputField, { label: "Tags (comma-separated)", type: "text", name: "tags", value: formData.tags, onChange: handleChange, disabled: loading, placeholder: "e.g., popular, chef-special, seasonal" }), _jsxs("div", { className: "form-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { className: "section-title", children: "Variants (Optional)" }), _jsx(Button, { type: "button", variant: "outline", onClick: addVariant, disabled: loading, children: "+ Add Variant" })] }), _jsx("p", { className: "field-help-text", children: "Add size or variant options (e.g., Small, Medium, Large)" }), variants.map((variant, index) => (_jsxs("div", { className: "dynamic-item-row", children: [_jsx("input", { type: "text", placeholder: "Variant name (e.g., Large)", value: variant.name, onChange: (e) => updateVariant(index, 'name', e.target.value), disabled: loading, className: "form-input" }), _jsx("input", { type: "number", placeholder: "Price", value: variant.price, onChange: (e) => updateVariant(index, 'price', e.target.value), disabled: loading, className: "form-input", step: "0.01", min: "0" }), _jsxs("label", { className: "checkbox-label-inline", children: [_jsx("input", { type: "checkbox", checked: variant.isDefault, onChange: (e) => updateVariant(index, 'isDefault', e.target.checked), disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Default" })] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => removeVariant(index), disabled: loading, children: "Remove" })] }, index)))] }), _jsxs("div", { className: "form-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { className: "section-title", children: "Add-ons (Optional)" }), _jsx(Button, { type: "button", variant: "outline", onClick: addAddon, disabled: loading, children: "+ Add Add-on" })] }), _jsx("p", { className: "field-help-text", children: "Add extra items customers can add (e.g., Extra Cheese, Bacon)" }), addons.map((addon, index) => (_jsxs("div", { className: "dynamic-item-row", children: [_jsx("input", { type: "text", placeholder: "Add-on name", value: addon.name, onChange: (e) => updateAddon(index, 'name', e.target.value), disabled: loading, className: "form-input" }), _jsx("input", { type: "number", placeholder: "Additional price", value: addon.price, onChange: (e) => updateAddon(index, 'price', e.target.value), disabled: loading, className: "form-input", step: "0.01", min: "0" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => removeAddon(index), disabled: loading, children: "Remove" })] }, index)))] }), _jsxs("div", { className: "form-section", children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { className: "section-title", children: "Customizations (Optional)" }), _jsx(Button, { type: "button", variant: "outline", onClick: addCustomization, disabled: loading, children: "+ Add Customization" })] }), _jsx("p", { className: "field-help-text", children: "Add customization options (e.g., \"Toppings\" with choices like \"Lettuce, Tomato\")" }), customizations.map((customization, index) => (_jsxs("div", { className: "dynamic-item-card", children: [_jsxs("div", { className: "dynamic-item-row", children: [_jsx("input", { type: "text", placeholder: "Customization name (e.g., Toppings)", value: customization.name, onChange: (e) => updateCustomization(index, 'name', e.target.value), disabled: loading, className: "form-input" }), _jsxs("label", { className: "checkbox-label-inline", children: [_jsx("input", { type: "checkbox", checked: customization.isRequired, onChange: (e) => updateCustomization(index, 'isRequired', e.target.checked), disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Required" })] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => removeCustomization(index), disabled: loading, children: "Remove" })] }), _jsx("input", { type: "text", placeholder: "Options (comma-separated, e.g., Lettuce, Tomato, Onion)", value: customization.options, onChange: (e) => updateCustomization(index, 'options', e.target.value), disabled: loading, className: "form-input" })] }, index)))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Scope" }), _jsxs("select", { name: "scope", value: formData.scope, onChange: handleChange, disabled: loading || isEditMode, className: "form-select", children: [_jsx("option", { value: "restaurant", children: "Restaurant-wide" }), _jsx("option", { value: "branch", children: "Branch-specific" })] }), isEditMode && (_jsx("p", { className: "field-help-text", children: "Scope cannot be changed after creation" }))] }), _jsx("div", { className: "form-row", children: _jsx(InputField, { label: "Display Order", type: "number", name: "displayOrder", value: formData.displayOrder, onChange: handleChange, disabled: loading, min: "0", placeholder: "0" }) }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", name: "isActive", checked: formData.isActive, onChange: handleChange, disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Item is active" })] }), _jsx("p", { className: "field-help-text", children: "Inactive items won't be visible to customers" })] }), _jsx("div", { className: "form-group", children: _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", name: "isAvailable", checked: formData.isAvailable, onChange: handleChange, disabled: loading, className: "form-checkbox" }), _jsx("span", { children: "Available for ordering" })] }) }), _jsxs("div", { className: "form-actions", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/staff/menu'), disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", loading: loading, "data-testid": "submit-button", children: isEditMode ? 'Update Menu Item' : 'Create Menu Item' })] })] })] }) }), _jsx("div", { className: "menuitem-preview-side", children: _jsx(MenuPreview, { formData: formData, categories: categories, selectedAllergens: selectedAllergens, selectedNutritionTags: selectedNutritionTags }) })] }));
};
