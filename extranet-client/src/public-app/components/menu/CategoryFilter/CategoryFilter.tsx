import React, { useRef, useEffect } from 'react';
import { Category } from '../../../types/menu.types';
import { ALL_CATEGORIES_ID, ALL_CATEGORIES_NAME, SCROLL_OFFSET } from '../../../utils/constants';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeButton = scrollContainerRef.current.querySelector('.category-filter-btn.active');
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);

    if (categoryId === ALL_CATEGORIES_ID) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const offsetPosition = element.offsetTop - SCROLL_OFFSET;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="category-filter-container">
      <div className="category-filter-scroll" ref={scrollContainerRef}>
        <button
          className={`category-filter-btn ${activeCategory === ALL_CATEGORIES_ID ? 'active' : ''}`}
          onClick={() => handleCategoryClick(ALL_CATEGORIES_ID)}
        >
          <div className="category-filter-icon">
            <span className="category-emoji">🍽️</span>
          </div>
          <span className="category-filter-name">{ALL_CATEGORIES_NAME}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-filter-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="category-filter-icon">
              {category.image ? (
                <img src={category.image} alt={category.name} className="category-filter-img" />
              ) : (
                <span className="category-emoji">🍴</span>
              )}
            </div>
            <span className="category-filter-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
