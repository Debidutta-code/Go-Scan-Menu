// extranet-client/src/modules/branch/pages/BranchListSkeleton.tsx
import React from 'react';
import './BranchListSkeleton.css';

export const BranchListSkeleton: React.FC = () => {
  return (
    <div className="branch-list-skeleton">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="branch-skeleton-row">
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-bar medium"></div>
          </div>
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-bar large"></div>
          </div>
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-bar medium"></div>
          </div>
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-bar large"></div>
          </div>
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-bar badge"></div>
          </div>
          <div className="branch-skeleton-cell">
            <div className="branch-skeleton-actions">
              <div className="branch-skeleton-bar circle"></div>
              <div className="branch-skeleton-bar circle"></div>
              <div className="branch-skeleton-bar circle"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
