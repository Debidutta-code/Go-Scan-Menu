// src/pages/staff/BranchSelectionSkeleton.tsx
import React from 'react';
import './BranchSelectionSkeleton.css';

export const BranchSelectionSkeleton: React.FC = () => {
    return (
        <div className="branch-selection-skeleton">
            <div className="skeleton-branch-header">
                <div className="skeleton-header-left">
                    <div className="skeleton-back-btn skeleton-shimmer"></div>
                    <div className="skeleton-title-group">
                        <div className="skeleton-page-title skeleton-shimmer"></div>
                        <div className="skeleton-page-subtitle skeleton-shimmer"></div>
                    </div>
                </div>
                <div className="skeleton-header-actions">
                    <div className="skeleton-shimmer" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
                </div>
            </div>

            <div className="skeleton-branches-grid">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-branch-card">
                        <div className="skeleton-card-header">
                            <div className="skeleton-branch-name skeleton-shimmer"></div>
                            <div className="skeleton-branch-status skeleton-shimmer"></div>
                        </div>

                        <div className="skeleton-card-info">
                            <div className="skeleton-info-row skeleton-shimmer"></div>
                            <div className="skeleton-info-row skeleton-shimmer"></div>
                            <div className="skeleton-info-row skeleton-shimmer"></div>
                        </div>

                        <div className="skeleton-branch-stats skeleton-shimmer"></div>

                        <div className="skeleton-card-action skeleton-shimmer"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
