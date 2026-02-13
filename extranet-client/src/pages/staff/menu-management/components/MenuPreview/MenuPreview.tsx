import React from 'react';
import './MenuPreview.css';
import { Allergen, AllergenLabels, Category, DietaryTypeIcons, DietaryTypeLabels, NutritionTag, NutritionTagLabels } from '../../types/menu.types';

interface MenuPreviewProps {
  formData: {
    name: string;
    description: string;
    categoryId: string;
    image: string;
    price: string;
    discountPrice: string;
    preparationTime: string;
    itemType: 'food' | 'drink';
    dietaryType: string;
    spiceLevel: string;
    tags: string;
    isAvailable: boolean;
  };
  categories: Category[];
  selectedAllergens: Allergen[];
  selectedNutritionTags: NutritionTag[];
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({
  formData,
  categories,
  selectedAllergens,
  selectedNutritionTags,
}) => {
  const selectedCategory = categories.find((c) => c._id === formData.categoryId);

  return (
    <div className="preview-card">
      <h3 className="preview-title">Preview</h3>
      <div className="menuitem-preview">
        {formData.image && (
          <div className="preview-image-container">
            <img
              src={formData.image}
              alt="Menu item preview"
              className="preview-image"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="preview-content">
          <div className="preview-header">
            <h4 className="preview-item-name">{formData.name || 'Menu Item Name'}</h4>
            <span className={`preview-availability ${formData.isAvailable ? 'available' : 'unavailable'}`}>
              {formData.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p className="preview-description">
            {formData.description || 'Menu item description will appear here'}
          </p>
          {selectedCategory && (
            <span className="preview-category">{selectedCategory.name}</span>
          )}
          {formData.itemType === 'food' && formData.dietaryType && (
            <span className="preview-dietary">
              {DietaryTypeIcons[formData.dietaryType as keyof typeof DietaryTypeIcons]}{' '}
              {DietaryTypeLabels[formData.dietaryType as keyof typeof DietaryTypeLabels]}
            </span>
          )}
          {formData.preparationTime && (
            <span className="preview-prep-time">⏱️ {formData.preparationTime} min</span>
          )}
          {formData.itemType === 'food' && formData.spiceLevel && (
            <span className="preview-spice">🌶️ {formData.spiceLevel}</span>
          )}
          <div className="preview-pricing">
            {formData.discountPrice ? (
              <>
                <span className="preview-original-price">${formData.price || '0.00'}</span>
                <span className="preview-discount-price">${formData.discountPrice || '0.00'}</span>
              </>
            ) : (
              <span className="preview-current-price">${formData.price || '0.00'}</span>
            )}
          </div>
          {selectedAllergens.length > 0 && (
            <div className="preview-section">
              <p className="preview-section-title">Allergens:</p>
              <div className="preview-tags">
                {selectedAllergens.map((allergen) => (
                  <span key={allergen} className="preview-tag allergen-tag">
                    {AllergenLabels[allergen]}
                  </span>
                ))}
              </div>
            </div>
          )}
          {selectedNutritionTags.length > 0 && (
            <div className="preview-section">
              <p className="preview-section-title">Nutrition:</p>
              <div className="preview-tags">
                {selectedNutritionTags.map((tag) => (
                  <span key={tag} className="preview-tag nutrition-tag">
                    {NutritionTagLabels[tag]}
                  </span>
                ))}
              </div>
            </div>
          )}
          {formData.tags && (
            <div className="preview-tags">
              {formData.tags.split(',').map((tag, idx) => (
                <span key={idx} className="preview-tag">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};