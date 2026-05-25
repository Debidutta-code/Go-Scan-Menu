import React from 'react';
import { Skeleton } from './Skeleton';

export const SkeletonCategoryGrid: React.FC = () => {
  return (
    <div className="category-grid">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="category-card" style={{ pointerEvents: 'none' }}>
          <Skeleton width="100%" height="100%" borderRadius="var(--radius-xl)" />
          <div className="category-card-overlay" style={{ background: 'transparent' }}>
             <Skeleton width="70%" height={20} borderRadius="var(--radius-sm)" />
          </div>
        </div>
      ))}
    </div>
  );
};
