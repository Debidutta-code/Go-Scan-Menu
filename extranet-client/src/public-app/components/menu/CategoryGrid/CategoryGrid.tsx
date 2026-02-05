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
    <div className="category-grid-section">
      <h2 className="category-grid-title">Categories</h2>
      <div className="category-grid">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className={`category-card ${index % 3 === 0 ? 'large' : ''}`}
            onClick={() => handleClick(category.id)}
          >
            {category.image ? (
              <img src={category.image} alt={category.name} className="category-card-image" />
            ) : (
              <div className="category-card-placeholder">
                <span className="placeholder-icon">🍴</span>
              </div>
            )}
            <div className="category-card-overlay">
              <h3 className="category-card-name">{category.name}</h3>
              <p className="category-card-count">{category.items.length} items</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
