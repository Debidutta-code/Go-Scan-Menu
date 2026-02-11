// src/pages/staff/CategoryPreview.tsx
import React from 'react';
import { Category } from '../../types/menu.types';
import { generateCategoryMasonryPattern } from '../../public-app/utils/categoryMasonryPattern';
import './CategoryPreview.css';

interface CategoryPreviewProps {
  categories: Category[];
}

export const CategoryPreview: React.FC<CategoryPreviewProps> = ({
  categories,
}) => {
  // Filter only active categories for preview
  const activeCategories = categories.filter((cat) => cat.isActive);

  const pattern = generateCategoryMasonryPattern(activeCategories.length);

  if (activeCategories.length === 0) {
    return (
      <div className="preview-empty-state">
        <div className="preview-empty-icon">📋</div>
        <p>No active categories to display</p>
      </div>
    );
  }

  return (
    <div className="category-preview-container">
      <div className="category-preview-grid">
        {activeCategories.map((category, index) => (
          <div
            key={category._id}
            className={`category-preview-card ${pattern[index] ? 'large' : 'small'}`}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="category-preview-image"
              />
            ) : (
              <div className="category-preview-placeholder">
                <span className="category-preview-placeholder-icon">🍴</span>
              </div>
            )}
            <div className="category-preview-overlay">
              <h3 className="category-preview-name">{category.name}</h3>
              <p className="category-preview-count">View items</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
