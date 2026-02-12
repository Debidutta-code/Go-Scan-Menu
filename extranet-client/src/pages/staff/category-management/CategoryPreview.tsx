// src/pages/staff/CategoryPreview.tsx
import React from 'react';
import { Category } from '../../../types/menu.types';
import { generateCategoryMasonryPattern } from '../../../public-app/utils/categoryMasonryPattern';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortablePreviewCard } from './SortablePreviewCard';
import { CategoryPreviewSkeleton } from './CategoryPreviewSkeleton';
import './CategoryPreview.css';

interface CategoryPreviewProps {
  categories: Category[];
  loading?: boolean;
  saving?: boolean;
}

export const CategoryPreview: React.FC<CategoryPreviewProps> = ({
  categories,
  loading = false,
  saving = false,
}) => {
  const activeCategories = categories.filter((cat) => cat.isActive);
  const pattern = generateCategoryMasonryPattern(activeCategories.length);

  if (loading) {
    // Show skeleton with a default count when initially loading
    return <CategoryPreviewSkeleton count={6} />;
  }

  if (saving) {
    // Show skeleton with actual category count when saving
    return <CategoryPreviewSkeleton saving={true} count={activeCategories.length} />;
  }

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
