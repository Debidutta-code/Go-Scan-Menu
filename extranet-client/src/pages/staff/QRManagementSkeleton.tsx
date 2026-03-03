// src/pages/staff/QRManagementSkeleton.tsx
import React from 'react';
import './QRManagementSkeleton.css';

export const QRManagementSkeleton: React.FC = () => {
    return (
        <div className="qr-management-skeleton">
            <div className="skeleton-toolbar">
                <div className="skeleton-title skeleton-shimmer"></div>
                <div className="skeleton-toolbar-actions">
                    <div className="skeleton-button skeleton-shimmer"></div>
                    <div className="skeleton-button skeleton-shimmer"></div>
                </div>
            </div>

            <div className="skeleton-content">
                <div className="skeleton-settings-panel">
                    <div className="skeleton-section">
                        <div className="skeleton-section-title skeleton-shimmer"></div>
                        <div className="skeleton-mode-buttons">
                            <div className="skeleton-mode-btn skeleton-shimmer"></div>
                            <div className="skeleton-mode-btn skeleton-shimmer"></div>
                        </div>
                    </div>

                    <div className="skeleton-section">
                        <div className="skeleton-section-title skeleton-shimmer"></div>
                        <div className="skeleton-grid">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="skeleton-grid-item skeleton-shimmer"></div>
                            ))}
                        </div>
                    </div>

                    <div className="skeleton-section">
                        <div className="skeleton-section-title skeleton-shimmer"></div>
                        <div className="skeleton-complexity-grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="skeleton-complexity-btn skeleton-shimmer"></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="skeleton-preview-panel">
                    <div className="skeleton-preview-box skeleton-shimmer"></div>
                    <div className="skeleton-preview-hint skeleton-shimmer"></div>
                </div>
            </div>
        </div>
    );
};
