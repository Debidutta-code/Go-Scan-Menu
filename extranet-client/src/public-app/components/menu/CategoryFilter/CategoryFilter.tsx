import React, { useRef, useEffect } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_NAME } from '@/public-app/utils/constants';
import './CategoryFilter.css';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;           // category._id of the highlighted tab
  onCategoryChange: (categoryId: string) => void;
  onBackToGrid: () => void;         // "All" button goes back to the grid page
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  onBackToGrid,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keep the active tab scrolled into view inside the filter bar
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector<HTMLElement>(
      '.public-category-filter-btn.active'
    );
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeCategory]);

  return (
    <div className="public-category-filter-container">
      <div className="public-category-filter-scroll" ref={scrollContainerRef}>
        {/* "All" button returns to the category grid */}
        <button
          className="public-category-filter-btn"
          onClick={onBackToGrid}
        >
          <div className="public-category-filter-icon">
            <span className="public-category-filter-emoji">🍽️</span>
          </div>
          <span className="public-category-filter-name">{ALL_CATEGORIES_NAME}</span>
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            className={`public-category-filter-btn ${
              activeCategory === category._id ? 'active' : ''
            }`}
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
};
