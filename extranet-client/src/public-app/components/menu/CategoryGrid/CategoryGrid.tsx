import React, { useMemo } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { generateCategoryMasonryPattern } from '@/public-app/utils/categoryMasonryPattern';
import { isImageCached, markImageAsCached } from '@/public-app/utils/image-cache';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = React.memo(({
  categories,
  onCategoryClick,
}) => {
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(cat => {
      if (cat.image && isImageCached(cat.image)) {
        initial[cat._id] = true;
      }
    });
    return initial;
  });
  const pattern = useMemo(() => generateCategoryMasonryPattern(categories.length), [categories.length]);

  const handleImageLoad = (id: string, url: string) => {
    markImageAsCached(url);
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

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
                className={`public-category-grid-card-image ${!loadedImages[category._id] ? 'loading' : ''}`}
                loading="lazy"
                decoding="async"
                onLoad={() => handleImageLoad(category._id, category.image!)}
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
                {category.items?.length || 0} items
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
