import React, { useRef, useEffect } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID, ALL_CATEGORIES_NAME } from '@/public-app/utils/constants';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = React.memo(({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeButton = container.querySelector('.public-category-filter-btn.active') as HTMLElement;

      if (activeButton) {
        const containerWidth = container.offsetWidth;
        const buttonOffsetLeft = activeButton.offsetLeft;
        const buttonWidth = activeButton.offsetWidth;

        const scrollTarget = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2);

        container.scrollTo({
          left: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory]);

  return (
    <div className="public-category-filter-container">
      <div className="public-category-filter-scroll" ref={scrollContainerRef}>
        <button
          className={`public-category-filter-btn ${activeCategory === ALL_CATEGORIES_ID ? 'active' : ''}`}
          onClick={() => onCategoryChange(ALL_CATEGORIES_ID)}
        >
          <div className="public-category-filter-icon">
            <span className="public-category-filter-emoji">🍽️</span>
          </div>
          <span className="public-category-filter-name">{ALL_CATEGORIES_NAME}</span>
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            className={`public-category-filter-btn ${activeCategory === category._id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category._id)}
          >
            <div className="public-category-filter-icon">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="public-category-filter-img"
                />
              ) : (
                <span className="public-category-filter-emoji">🍴</span>
              )}
            </div>
            <span className="public-category-filter-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
