import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffAuth } from '@/modules/auth/contexts/StaffAuthContext';
import { MenuAPI } from '@/modules/menu/pages/api/menu-api';
import { validateMenuItem } from '@/modules/menu/pages/utils/validation';
import { 
  Category, 
  DietaryType, 
  DietaryTypeLabels,
  DietaryTypeIcons,
} from '@/shared/types/menu.types';
import { InputField } from '@/shared/components/InputField';
import { Button } from '@/shared/components/Button';
import { MenuPreview } from '@/modules/menu/pages/components/MenuPreview/MenuPreview';
import { toast } from 'react-toastify';
import './AddEditMenuItem.css';

export const AddEditMenuItem: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { staff, token } = useStaffAuth();

  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: '',
    price: '',
    itemType: 'food' as 'food' | 'drink',
    dietaryType: '' as '' | DietaryType,
    isAvailable: true,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (staff && token) {
      loadInitialData();
    }
  }, [staff, token]);

  const loadInitialData = async () => {
    if (!staff || !token) return;

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
            price: item.price.toString(),
            itemType: item.itemType || 'food',
            dietaryType: item.dietaryType || '',
            isAvailable: item.isAvailable,
            isActive: item.isActive,
          });
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
      if (isEditMode) navigate('/staff/menu');
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDietaryTypeSelect = (type: DietaryType) => setFormData((prev) => ({ ...prev, dietaryType: type }));

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
        price: parseFloat(formData.price),
        itemType: formData.itemType,
        dietaryType: formData.itemType === 'food' ? formData.dietaryType || undefined : undefined,
        isAvailable: formData.isAvailable,
        isActive: formData.isActive,
      };
      if (isEditMode && id) await MenuAPI.updateMenuItem(token, staff.restaurantId, id, payload);
      else await MenuAPI.createMenuItem(token, staff.restaurantId, payload);
      toast.success(isEditMode ? 'Menu item updated!' : 'Menu item created!');
      navigate('/staff/menu');
    } catch (err: any) {
      toast.error(err.message || 'Error saving item');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div className="add-edit-menuitem-container"><div className="loading-state">Loading...</div></div>;

  return (
    <div className="add-edit-menuitem-split-container">
      <div className="menuitem-form-side">
        <div className="menuitem-form-card">
          <div className="form-header">
            <Button variant="outline" onClick={() => navigate('/staff/menu')} disabled={loading}>← Back</Button>
            <h1 className="form-title">{isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
            <p className="form-subtitle">Enter the menu item details below</p>
          </div>

          <form onSubmit={handleSubmit} className="menuitem-form">
            <div className="form-group">
              <label className="form-label">Item Type <span className="required-label">*</span></label>
              <div className="radio-card-group">
                <label className={`radio-card ${formData.itemType === 'food' ? 'selected' : ''}`}>
                  <input type="radio" name="itemType" value="food" checked={formData.itemType === 'food'} onChange={handleChange} disabled={loading || isEditMode} className="radio-card-input" />
                  <div className="radio-card-content"><span className="radio-card-icon">🍽️</span><span className="radio-card-label">Food</span></div>
                </label>
                <label className={`radio-card ${formData.itemType === 'drink' ? 'selected' : ''}`}>
                  <input type="radio" name="itemType" value="drink" checked={formData.itemType === 'drink'} onChange={handleChange} disabled={loading || isEditMode} className="radio-card-input" />
                  <div className="radio-card-content"><span className="radio-card-icon">🥤</span><span className="radio-card-label">Drink</span></div>
                </label>
              </div>
            </div>

            <InputField label="Item Name" type="text" name="name" value={formData.name} error={errors.name} onChange={handleChange} disabled={loading} required autoFocus />

            <div className="form-group">
              <label className="form-label">Category <span className="required-label">*</span></label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} disabled={loading} className={`form-select ${errors.categoryId ? 'error' : ''}`} required>
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} disabled={loading} className="form-textarea" rows={3} placeholder="Brief description" />
            </div>

            {formData.itemType === 'food' && (
              <div className="form-group">
                <label className="form-label">Dietary Type <span className="required-label">*</span></label>
                <div className="selection-card-grid">
                  {Object.values(DietaryType).map((type) => (
                    <button key={type} type="button" onClick={() => handleDietaryTypeSelect(type)} className={`selection-card ${formData.dietaryType === type ? 'selected' : ''}`}>
                      <span className="selection-card-icon">{DietaryTypeIcons[type]}</span><span className="selection-card-label">{DietaryTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <InputField label="Image URL" type="text" name="image" value={formData.image} onChange={handleChange} disabled={loading} placeholder="https://..." />

            <InputField label="Base Price" type="number" name="price" value={formData.price} error={errors.price} onChange={handleChange} disabled={loading} required step="0.01" />

            <div className="form-actions">
              <Button type="button" variant="outline" onClick={() => navigate('/staff/menu')} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} data-testid="submit-button">{isEditMode ? 'Update Item' : 'Create Item'}</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="menuitem-preview-side">
        <MenuPreview formData={formData as any} categories={categories} selectedAllergens={[]} selectedNutritionTags={[]} />
      </div>
    </div>
  );
};
