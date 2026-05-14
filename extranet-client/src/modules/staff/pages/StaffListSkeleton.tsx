// extranet-client/src/modules/staff/pages/StaffListSkeleton.tsx
import React from 'react';
import './StaffListSkeleton.css';

export const StaffListSkeleton: React.FC = () => {
  return (
    <div className="staff-list-skeleton">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="staff-skeleton-row">
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-bar medium"></div>
          </div>
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-bar large"></div>
          </div>
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-bar medium"></div>
          </div>
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-bar badge"></div>
          </div>
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-bar badge"></div>
          </div>
          <div className="staff-skeleton-cell">
            <div className="staff-skeleton-actions">
              <div className="staff-skeleton-bar circle"></div>
              <div className="staff-skeleton-bar circle"></div>
              <div className="staff-skeleton-bar circle"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
