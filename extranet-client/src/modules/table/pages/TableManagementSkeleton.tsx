// src/pages/staff/TableManagementSkeleton.tsx
import React from 'react';
import './TableManagementSkeleton.css';

export const TableManagementSkeleton: React.FC = () => {
    return (
        <div className="table-management-skeleton">
            <div className="skeleton-content">
                <div className="skeleton-panel-header skeleton-shimmer"></div>

                {[1, 2].map((group) => (
                    <div key={group} className="skeleton-location-group">
                        <div className="skeleton-location-header skeleton-shimmer"></div>
                        <div className="skeleton-grid">
                            {Array.from({ length: group === 1 ? 12 : 8 }).map((_, i) => (
                                <div key={i} className="skeleton-cube skeleton-shimmer"></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
