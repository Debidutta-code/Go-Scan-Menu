// src/pages/staff/CategoryListSkeleton.tsx
import React from 'react';
import './CategoryListSkeleton.css';

export const CategoryListSkeleton: React.FC = () => {
  return (
    <div className="category-list">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="staff-category-sort-skeleton-item">
          <div className="staff-category-sort-skeleton-handle"></div>
          <div className="staff-category-sort-skeleton-content">
            <div className="staff-category-sort-skeleton-main">
              <div className="staff-category-sort-skeleton-title"></div>
              <div className="staff-category-sort-skeleton-description"></div>
              <div className="staff-category-sort-skeleton-meta">
                <div className="staff-category-sort-skeleton-badge"></div>
                <div className="staff-category-sort-skeleton-badge"></div>
              </div>
            </div>
            <div className="staff-category-sort-skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
