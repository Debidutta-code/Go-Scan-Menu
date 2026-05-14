// src/pages/staff/RolePermissionsSkeleton.tsx
import React from 'react';
import './RolePermissionsSkeleton.css';

// Number of placeholder rows per card
const PERM_COUNTS = [6, 6, 5, 3, 4, 5, 2];

const CardSkeleton: React.FC<{ rows: number }> = ({ rows }) => (
    <div className="rps-card">
        <div className="rps-card-head">
            <div className="rps-card-meta">
                <span className="rps-icon-chip rps-shimmer" />
                <div className="rps-card-text">
                    <span className="rps-card-title rps-shimmer" />
                    <span className="rps-card-desc rps-shimmer" />
                </div>
            </div>
            <div className="rps-card-controls">
                <span className="rps-count rps-shimmer" />
                <span className="rps-selectall rps-shimmer" />
            </div>
        </div>

        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="rps-perm-row">
                <span className="rps-perm-label rps-shimmer" style={{ width: `${110 + (i % 3) * 30}px` }} />
                <span className="rps-perm-toggle rps-shimmer" />
            </div>
        ))}
    </div>
);

export const RolePermissionsSkeleton: React.FC = () => (
    <>
        {/* Toolbar */}
        <div className="rps-toolbar">
            <div className="rps-toolbar-left">
                <span className="rps-toolbar-title rps-shimmer" />
                <span className="rps-toolbar-sub rps-shimmer" />
            </div>
            <div className="rps-toolbar-right">
                <span className="rps-toolbar-select rps-shimmer" />
                <span className="rps-toolbar-btn rps-shimmer" />
            </div>
        </div>

        {/* Grid */}
        <div className="rps-grid">
            {PERM_COUNTS.map((rows, i) => (
                <CardSkeleton key={i} rows={rows} />
            ))}
        </div>
    </>
);