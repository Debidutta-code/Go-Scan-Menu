import React from 'react';
import { Skeleton } from './Skeleton';

export const SkeletonCategoryFilter: React.FC = () => {
  return (
    <div className="public-category-filter-container" style={{ overflow: 'hidden' }}>
      <div className="public-category-filter-scroll">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="public-category-filter-btn" style={{ pointerEvents: 'none' }}>
            <Skeleton circle width={32} height={32} />
            <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
};
