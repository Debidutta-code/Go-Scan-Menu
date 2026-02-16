import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../../../../../contexts/StaffAuthContext';
import { MenuAPI } from '../../api/menu-api';
import { validateMenuItem } from '../../utils/validation';
import {
    Category,
    DietaryType,
    NutritionTag,
    Allergen,
    DrinkTemperature,
    DrinkAlcoholContent,
    DrinkCaffeineContent,
    DietaryTypeLabels,
    DietaryTypeIcons,
    AllergenLabels,
    NutritionTagLabels,
    DrinkTemperatureLabels,
    DrinkAlcoholContentLabels,
    DrinkCaffeineContentLabels,
} from '../../types/menu.types';
import { InputField } from '../../../../../components/ui/InputField';
import { Button } from '../../../../../components/ui/Button';
import { MenuPreview } from '../../components/MenuPreview/MenuPreview';
import './MenuModal.css';

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItemId?: string | null;
    onSuccess: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
    isOpen,
    onClose,
    menuItemId,
    onSuccess,
}) => {
    const { staff, token } = useStaffAuth();
    const isEditMode = !!menuItemId;

    const [categories, setCategories] = useState<Category[]>([]);
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
        spiceLevel: '' as '' | 'mild' | 'medium' | 'hot' | 'extra_hot',
        tags: '',
        itemType: 'food' as 'food' | 'drink',
        dietaryType: '' as '' | DietaryType,
        drinkTemperature: '' as '' | DrinkTemperature,
        drinkAlcoholContent: '' as '' | DrinkAlcoholContent,
        drinkCaffeineContent: '' as '' | DrinkCaffeineContent,
        scope: 'restaurant' as 'restaurant' | 'branch',
        isAvailable: true,
        availableQuantity: '',
        isActive: true,
        displayOrder: '0',
    });

    const [selectedAllergens, setSelectedAllergens] = useState<Allergen[]>([]);
    const [selectedNutritionTags, setSelectedNutritionTags] = useState<NutritionTag[]>([]);
    const [variants, setVariants] = useState<Array<{ name: string; price: string; isDefault: boolean }>>([]);
    const [addons, setAddons] = useState<Array<{ name: string; price: string }>>([]);
    const [customizations, setCustomizations] = useState<Array<{ name: string; options: string; isRequired: boolean }>>([]);

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (isOpen && staff && token) {
            loadInitialData();
        } else if (!isOpen) {
            // Reset form when closed
            resetForm();
        }
    }, [isOpen, menuItemId, staff, token]);

    const resetForm = () => {
        setFormData({
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
        setSelectedAllergens([]);
        setSelectedNutritionTags([]);
        setVariants([]);
        setAddons([]);
        setCustomizations([]);
        setErrors({});
    };

    const loadInitialData = async () => {
        if (!staff || !token) return;

        setLoadingData(true);
        try {
            const categoriesData = await MenuAPI.getCategories(token, staff.restaurantId);
            setCategories(categoriesData);

            if (isEditMode && menuItemId) {
                const item = await MenuAPI.getMenuItem(token, staff.restaurantId, menuItemId);
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
                        setSelectedAllergens(item.allergens as Allergen[]);
                    }

                    if (item.nutritionTags && Array.isArray(item.nutritionTags)) {
                        setSelectedNutritionTags(item.nutritionTags as NutritionTag[]);
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
        } catch (err: any) {
            // Use alert or toast? keeping it simple like original
            // alert(err.message || 'Failed to load data');
            // In modal, maybe just close or show error
            console.error(err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleDietaryTypeSelect = (type: DietaryType) => {
        setFormData((prev) => ({ ...prev, dietaryType: type }));
        if (errors.dietaryType) {
            setErrors((prev) => ({ ...prev, dietaryType: '' }));
        }
    };

    const handleDrinkTemperatureSelect = (temp: DrinkTemperature) => {
        setFormData((prev) => ({ ...prev, drinkTemperature: temp }));
    };

    const handleDrinkAlcoholSelect = (alcohol: DrinkAlcoholContent) => {
        setFormData((prev) => ({ ...prev, drinkAlcoholContent: alcohol }));
    };

    const handleDrinkCaffeineSelect = (caffeine: DrinkCaffeineContent) => {
        setFormData((prev) => ({ ...prev, drinkCaffeineContent: caffeine }));
    };

    const handleAllergenToggle = (allergen: Allergen) => {
        setSelectedAllergens((prev) =>
            prev.includes(allergen)
                ? prev.filter((a) => a !== allergen)
                : [...prev, allergen]
        );
    };

    const handleNutritionTagToggle = (tag: NutritionTag) => {
        setSelectedNutritionTags((prev) =>
            prev.includes(tag)
                ? prev.filter((t) => t !== tag)
                : [...prev, tag]
        );
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', price: '', isDefault: false }]);
    };

    const updateVariant = (index: number, field: string, value: string | boolean) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const addAddon = () => {
        setAddons([...addons, { name: '', price: '' }]);
    };

    const updateAddon = (index: number, field: string, value: string) => {
        const updated = [...addons];
        updated[index] = { ...updated[index], [field]: value };
        setAddons(updated);
    };

    const removeAddon = (index: number) => {
        setAddons(addons.filter((_, i) => i !== index));
    };

    const addCustomization = () => {
        setCustomizations([...customizations, { name: '', options: '', isRequired: false }]);
    };

    const updateCustomization = (index: number, field: string, value: string | boolean) => {
        const updated = [...customizations];
        updated[index] = { ...updated[index], [field]: value };
        setCustomizations(updated);
    };

    const removeCustomization = (index: number) => {
        setCustomizations(customizations.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = validateMenuItem(formData);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || !staff || !token) return;

        setLoading(true);

        try {
            const payload: any = {
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

            if (isEditMode && menuItemId) {
                await MenuAPI.updateMenuItem(token, staff.restaurantId, menuItemId, payload);
            } else {
                await MenuAPI.createMenuItem(token, staff.restaurantId, payload);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message || `Failed to ${isEditMode ? 'update' : 'create'} menu item`);
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="menu-modal-overlay" onClick={handleOverlayClick}>
            <div className="menu-modal-container">
                {/* Close button */}
                <button
                    className="menu-modal-close"
                    onClick={onClose}
                    disabled={loading || loadingData}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {loadingData ? (
                    <div className="menu-modal-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading menu data...</p>
                    </div>
                ) : (
                    <div className="menu-modal-content">
                        {/* Left side: Form */}
                        <div className="menu-modal-form-side">
                            <div className="menu-modal-header">
                                <h2 className="menu-modal-title">
                                    {isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}
                                </h2>
                                <p className="menu-modal-subtitle">
                                    {isEditMode ? 'Update menu item details' : 'Add a new item to your menu'}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="menu-modal-form">
                                {/* Item Type Selection */}
                                <div className="form-group">
                                    <label className="form-label">
                                        Item Type <span className="required-label">*</span>
                                    </label>
                                    <div className="radio-card-group">
                                        <label className={`radio-card ${formData.itemType === 'food' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="itemType"
                                                value="food"
                                                checked={formData.itemType === 'food'}
                                                onChange={handleChange}
                                                disabled={loading || isEditMode}
                                                className="radio-card-input"
                                            />
                                            <div className="radio-card-content">
                                                <span className="radio-card-icon">🍽️</span>
                                                <span className="radio-card-label">Food</span>
                                            </div>
                                        </label>
                                        <label className={`radio-card ${formData.itemType === 'drink' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="itemType"
                                                value="drink"
                                                checked={formData.itemType === 'drink'}
                                                onChange={handleChange}
                                                disabled={loading || isEditMode}
                                                className="radio-card-input"
                                            />
                                            <div className="radio-card-content">
                                                <span className="radio-card-icon">🥤</span>
                                                <span className="radio-card-label">Drink</span>
                                            </div>
                                        </label>
                                    </div>
                                    {isEditMode && (
                                        <p className="field-help-text">Item type cannot be changed after creation</p>
                                    )}
                                </div>

                                <InputField
                                    label="Item Name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    error={errors.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                    autoFocus
                                />

                                <div className="form-group">
                                    <label className="form-label">
                                        Category <span className="required-label">*</span>
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`form-select ${errors.categoryId ? 'error' : ''}`}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Description <span className="optional-label">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="Brief description of this menu item"
                                    />
                                </div>

                                {/* Conditional Fields Based on Item Type */}
                                {formData.itemType === 'food' && (
                                    <div className="form-group">
                                        <label className="form-label">
                                            Dietary Type <span className="required-label">*</span>
                                        </label>
                                        <div className="selection-card-grid">
                                            {Object.values(DietaryType).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => handleDietaryTypeSelect(type)}
                                                    disabled={loading}
                                                    className={`selection-card ${formData.dietaryType === type ? 'selected' : ''} ${errors.dietaryType ? 'error' : ''}`}
                                                >
                                                    <span className="selection-card-icon">{DietaryTypeIcons[type]}</span>
                                                    <span className="selection-card-label">{DietaryTypeLabels[type]}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {errors.dietaryType && <span className="error-text">{errors.dietaryType}</span>}
                                    </div>
                                )}

                                {formData.itemType === 'drink' && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Temperature (Optional)</label>
                                            <div className="selection-card-grid two-column">
                                                {Object.values(DrinkTemperature).map((temp) => (
                                                    <button
                                                        key={temp}
                                                        type="button"
                                                        onClick={() => handleDrinkTemperatureSelect(temp)}
                                                        disabled={loading}
                                                        className={`selection-card ${formData.drinkTemperature === temp ? 'selected' : ''}`}
                                                    >
                                                        <span className="selection-card-icon">
                                                            {temp === DrinkTemperature.HOT ? '🔥' : '❄️'}
                                                        </span>
                                                        <span className="selection-card-label">{DrinkTemperatureLabels[temp]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Alcohol Content (Optional)</label>
                                            <div className="selection-card-grid two-column">
                                                {Object.values(DrinkAlcoholContent).map((alcohol) => (
                                                    <button
                                                        key={alcohol}
                                                        type="button"
                                                        onClick={() => handleDrinkAlcoholSelect(alcohol)}
                                                        disabled={loading}
                                                        className={`selection-card ${formData.drinkAlcoholContent === alcohol ? 'selected' : ''}`}
                                                    >
                                                        <span className="selection-card-icon">
                                                            {alcohol === DrinkAlcoholContent.ALCOHOLIC ? '🍺' : '🚫'}
                                                        </span>
                                                        <span className="selection-card-label">{DrinkAlcoholContentLabels[alcohol]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Caffeine Content (Optional)</label>
                                            <div className="selection-card-grid two-column">
                                                {Object.values(DrinkCaffeineContent).map((caffeine) => (
                                                    <button
                                                        key={caffeine}
                                                        type="button"
                                                        onClick={() => handleDrinkCaffeineSelect(caffeine)}
                                                        disabled={loading}
                                                        className={`selection-card ${formData.drinkCaffeineContent === caffeine ? 'selected' : ''}`}
                                                    >
                                                        <span className="selection-card-icon">
                                                            {caffeine === DrinkCaffeineContent.CAFFEINATED ? '⚡' : '😴'}
                                                        </span>
                                                        <span className="selection-card-label">{DrinkCaffeineContentLabels[caffeine]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <InputField
                                    label="Image URL"
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="https://example.com/image.jpg (Optional)"
                                />

                                <div className="form-group">
                                    <label className="form-label">
                                        Additional Images <span className="optional-label">(Optional, comma-separated URLs)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="images"
                                        value={formData.images}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="form-input"
                                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                    />
                                    <p className="field-help-text">Multiple images for gallery view</p>
                                </div>

                                <div className="form-row">
                                    <InputField
                                        label="Price"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        error={errors.price}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                        step="0.01"
                                        min="0"
                                    />

                                    <InputField
                                        label="Discount Price (Optional)"
                                        type="number"
                                        name="discountPrice"
                                        value={formData.discountPrice}
                                        error={errors.discountPrice}
                                        onChange={handleChange}
                                        disabled={loading}
                                        step="0.01"
                                        min="0"
                                    />
                                </div>

                                <div className="form-row">
                                    <InputField
                                        label="Prep Time (mins)"
                                        type="number"
                                        name="preparationTime"
                                        value={formData.preparationTime}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="0"
                                    />

                                    <InputField
                                        label="Calories"
                                        type="number"
                                        name="calories"
                                        value={formData.calories}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="0"
                                        placeholder="Optional"
                                    />
                                </div>

                                {formData.itemType === 'food' && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Spice Level</label>
                                            <select
                                                name="spiceLevel"
                                                value={formData.spiceLevel}
                                                onChange={handleChange}
                                                disabled={loading}
                                                className="form-select"
                                            >
                                                <option value="">None</option>
                                                <option value="mild">Mild</option>
                                                <option value="medium">Medium</option>
                                                <option value="hot">Hot</option>
                                                <option value="extra_hot">Extra Hot</option>
                                            </select>
                                        </div>

                                        <InputField
                                            label="Available Quantity"
                                            type="number"
                                            name="availableQuantity"
                                            value={formData.availableQuantity}
                                            onChange={handleChange}
                                            disabled={loading}
                                            min="0"
                                            placeholder="Optional (leave empty for unlimited)"
                                        />
                                    </div>
                                )}

                                {formData.itemType === 'drink' && (
                                    <InputField
                                        label="Available Quantity"
                                        type="number"
                                        name="availableQuantity"
                                        value={formData.availableQuantity}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="0"
                                        placeholder="Optional (leave empty for unlimited)"
                                    />
                                )}

                                {/* Allergens Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Allergens (Optional)</h3>
                                    <p className="field-help-text">Select all allergens present in this item</p>
                                    <div className="checkbox-card-grid">
                                        {Object.values(Allergen).map((allergen) => (
                                            <label key={allergen} className={`checkbox-card ${selectedAllergens.includes(allergen) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedAllergens.includes(allergen)}
                                                    onChange={() => handleAllergenToggle(allergen)}
                                                    disabled={loading}
                                                    className="checkbox-card-input"
                                                />
                                                <div className="checkbox-card-content">
                                                    <span className="checkbox-card-check">✓</span>
                                                    <span className="checkbox-card-label">{AllergenLabels[allergen]}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Nutrition Tags Section */}
                                <div className="form-section">
                                    <h3 className="section-title">Nutrition Tags (Optional)</h3>
                                    <p className="field-help-text">Select applicable nutrition tags</p>
                                    <div className="checkbox-card-grid">
                                        {Object.values(NutritionTag).map((tag) => (
                                            <label key={tag} className={`checkbox-card ${selectedNutritionTags.includes(tag) ? 'selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedNutritionTags.includes(tag)}
                                                    onChange={() => handleNutritionTagToggle(tag)}
                                                    disabled={loading}
                                                    className="checkbox-card-input"
                                                />
                                                <div className="checkbox-card-content">
                                                    <span className="checkbox-card-check">✓</span>
                                                    <span className="checkbox-card-label">{NutritionTagLabels[tag]}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <InputField
                                    label="Tags (comma-separated)"
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="e.g., popular, chef-special, seasonal"
                                />

                                {/* Variants Section */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Variants (Optional)</h3>
                                        <Button type="button" variant="outline" onClick={addVariant} disabled={loading}>
                                            + Add Variant
                                        </Button>
                                    </div>
                                    <p className="field-help-text">Add size or variant options (e.g., Small, Medium, Large)</p>
                                    {variants.map((variant, index) => (
                                        <div key={index} className="dynamic-item-row">
                                            <input
                                                type="text"
                                                placeholder="Variant name (e.g., Large)"
                                                value={variant.name}
                                                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                                disabled={loading}
                                                className="form-input"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                value={variant.price}
                                                onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                disabled={loading}
                                                className="form-input"
                                                step="0.01"
                                                min="0"
                                            />
                                            <label className="checkbox-label-inline">
                                                <input
                                                    type="checkbox"
                                                    checked={variant.isDefault}
                                                    onChange={(e) => updateVariant(index, 'isDefault', e.target.checked)}
                                                    disabled={loading}
                                                    className="form-checkbox"
                                                />
                                                <span>Default</span>
                                            </label>
                                            <Button type="button" variant="outline" onClick={() => removeVariant(index)} disabled={loading}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Addons Section */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Add-ons (Optional)</h3>
                                        <Button type="button" variant="outline" onClick={addAddon} disabled={loading}>
                                            + Add Add-on
                                        </Button>
                                    </div>
                                    <p className="field-help-text">Add extra items customers can add (e.g., Extra Cheese, Bacon)</p>
                                    {addons.map((addon, index) => (
                                        <div key={index} className="dynamic-item-row">
                                            <input
                                                type="text"
                                                placeholder="Add-on name"
                                                value={addon.name}
                                                onChange={(e) => updateAddon(index, 'name', e.target.value)}
                                                disabled={loading}
                                                className="form-input"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Additional price"
                                                value={addon.price}
                                                onChange={(e) => updateAddon(index, 'price', e.target.value)}
                                                disabled={loading}
                                                className="form-input"
                                                step="0.01"
                                                min="0"
                                            />
                                            <Button type="button" variant="outline" onClick={() => removeAddon(index)} disabled={loading}>
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Customizations Section */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3 className="section-title">Customizations (Optional)</h3>
                                        <Button type="button" variant="outline" onClick={addCustomization} disabled={loading}>
                                            + Add Customization
                                        </Button>
                                    </div>
                                    <p className="field-help-text">Add customization options (e.g., "Toppings" with choices like "Lettuce, Tomato")</p>
                                    {customizations.map((customization, index) => (
                                        <div key={index} className="dynamic-item-card">
                                            <div className="dynamic-item-row">
                                                <input
                                                    type="text"
                                                    placeholder="Customization name (e.g., Toppings)"
                                                    value={customization.name}
                                                    onChange={(e) => updateCustomization(index, 'name', e.target.value)}
                                                    disabled={loading}
                                                    className="form-input"
                                                />
                                                <label className="checkbox-label-inline">
                                                    <input
                                                        type="checkbox"
                                                        checked={customization.isRequired}
                                                        onChange={(e) => updateCustomization(index, 'isRequired', e.target.checked)}
                                                        disabled={loading}
                                                        className="form-checkbox"
                                                    />
                                                    <span>Required</span>
                                                </label>
                                                <Button type="button" variant="outline" onClick={() => removeCustomization(index)} disabled={loading}>
                                                    Remove
                                                </Button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Options (comma-separated, e.g., Lettuce, Tomato, Onion)"
                                                value={customization.options}
                                                onChange={(e) => updateCustomization(index, 'options', e.target.value)}
                                                disabled={loading}
                                                className="form-input"
                                                style={{ marginTop: '8px', width: '100%' }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Scope</label>
                                    <select
                                        name="scope"
                                        value={formData.scope}
                                        onChange={handleChange}
                                        disabled={loading || isEditMode}
                                        className="form-select"
                                    >
                                        <option value="restaurant">Restaurant-wide</option>
                                        <option value="branch">Branch-specific</option>
                                    </select>
                                    {isEditMode && (
                                        <p className="field-help-text">Scope cannot be changed after creation</p>
                                    )}
                                </div>

                                <div className="form-row">
                                    <InputField
                                        label="Display Order"
                                        type="number"
                                        name="displayOrder"
                                        value={formData.displayOrder}
                                        onChange={handleChange}
                                        disabled={loading}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="form-checkbox"
                                        />
                                        <span>Item is active</span>
                                    </label>
                                    <p className="field-help-text">
                                        Inactive items won&apos;t be visible to customers
                                    </p>
                                </div>

                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="isAvailable"
                                            checked={formData.isAvailable}
                                            onChange={handleChange}
                                            disabled={loading}
                                            className="form-checkbox"
                                        />
                                        <span>Available for ordering</span>
                                    </label>
                                </div>

                                <div className="menu-modal-actions">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">
                                        {isEditMode ? 'Update Menu Item' : 'Create Menu Item'}
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Right side: Preview */}
                        <div className="menu-modal-preview-side">
                            <div className="preview-wrapper">
                                <MenuPreview
                                    formData={formData}
                                    categories={categories}
                                    selectedAllergens={selectedAllergens}
                                    selectedNutritionTags={selectedNutritionTags}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
