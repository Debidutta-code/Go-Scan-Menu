// src/pages/staff/CategoryPreviewSkeleton.tsx
import React from 'react';
import { generateCategoryMasonryPattern } from '../../../public-app/utils/categoryMasonryPattern';
import './CategoryPreviewSkeleton.css';

interface CategoryPreviewSkeletonProps {
  saving?: boolean;
  count?: number;
}

export const CategoryPreviewSkeleton: React.FC<CategoryPreviewSkeletonProps> = ({
  saving = false,
  count = 8,
}) => {
  const skeletonPattern = generateCategoryMasonryPattern(count);

  return (
    <div className="category-preview-wrapper">
      <div className="category-preview-grid">
        {skeletonPattern.map((isLarge, index) => (
          <div
            key={index}
            className={`staff-category-sort-skeleton-preview-card ${
              isLarge ? 'large' : 'small'
            }`}
          >
            <div className="staff-category-sort-skeleton-preview-image"></div>
            <div className="staff-category-sort-skeleton-preview-overlay">
              <div className="staff-category-sort-skeleton-preview-name"></div>
              <div className="staff-category-sort-skeleton-preview-count"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};