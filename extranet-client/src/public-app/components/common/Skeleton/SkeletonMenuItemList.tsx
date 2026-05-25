import React from 'react';
import { Skeleton } from './Skeleton';

export const SkeletonMenuItemList: React.FC = () => {
  return (
    <div className="menu-page-content">
      {[1, 2].map((section) => (
        <div key={section} className="category-section" style={{ marginBottom: '24px' }}>
          <Skeleton width={150} height={24} style={{ marginBottom: '16px', marginLeft: '16px' }} />
          <div className="menu-items-list">
            {[1, 2, 3].map((item) => (
              <div key={item} className="menu-item-card" style={{ pointerEvents: 'none', display: 'flex', gap: '12px', padding: '12px' }}>
                <div style={{ flex: 1 }}>
                  <Skeleton width="80%" height={20} style={{ marginBottom: '8px' }} />
                  <Skeleton width="100%" height={40} style={{ marginBottom: '8px' }} />
                  <Skeleton width="40%" height={20} />
                </div>
                <Skeleton width={100} height={100} borderRadius="var(--radius-lg)" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
