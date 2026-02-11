// src/pages/staff/CategoryPreview.tsx
import React from 'react';
import { Category } from '../../../types/menu.types';
import { generateCategoryMasonryPattern } from '../../../public-app/utils/categoryMasonryPattern';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePreviewCard } from './SortablePreviewCard';
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
    <div className="category-preview-wrapper">
      <SortableContext
        items={activeCategories.map((cat) => cat._id)}
        strategy={rectSortingStrategy}
      >
        <div className="category-preview-grid">
          {activeCategories.map((category, index) => (
            <SortablePreviewCard
              key={category._id}
              category={category}
              isLarge={pattern[index]}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
