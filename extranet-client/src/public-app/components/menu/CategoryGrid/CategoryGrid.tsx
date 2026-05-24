import React, { useMemo } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { generateCategoryMasonryPattern } from '@/public-app/utils/categoryMasonryPattern';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = React.memo(({
  categories,
  onCategoryClick,
}) => {
  const pattern = useMemo(() => generateCategoryMasonryPattern(categories.length), [categories.length]);

  return (
    <div className="public-category-grid-section">
      <div className="public-category-grid">
        {categories.map((category, index) => (
          <div
            key={category._id}
            className={`public-category-grid-card ${
              pattern[index] ? 'large' : 'small'
            }`}
            onClick={() => onCategoryClick(category._id)}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="public-category-grid-card-image"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="public-category-grid-card-placeholder">
                <span className="public-category-grid-placeholder-icon">🍴</span>
              </div>
            )}
            <div className="public-category-grid-card-overlay">
              <h3 className="public-category-grid-card-name">
                {category.name}
              </h3>
              <p className="public-category-grid-card-count">
                {category.items.length} items
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
