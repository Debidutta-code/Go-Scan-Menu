import React from 'react';
import { Category } from '../../../types/menu.types';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, onCategoryClick }) => {
  const handleClick = (categoryId: string) => {
    onCategoryClick(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offsetPosition = element.offsetTop - 150;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="public-category-grid-section">
      <h2 className="public-category-grid-title">Categories</h2>
      <div className="public-category-grid">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`public-category-grid-card ${index % 3 === 0 ? 'large' : ''}`}
            onClick={() => handleClick(category.id)}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="public-category-grid-card-image"
              />
            ) : (
              <div className="public-category-grid-card-placeholder">
                <span className="public-category-grid-placeholder-icon">🍴</span>
              </div>
            )}
            <div className="public-category-grid-card-overlay">
              <h3 className="public-category-grid-card-name">{category.name}</h3>
              <p className="public-category-grid-card-count">{category.items.length} items</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
