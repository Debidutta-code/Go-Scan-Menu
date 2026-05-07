// src/pages/staff/TableManagementSkeleton.tsx
import React from 'react';
import './TableManagementSkeleton.css';

export const TableManagementSkeleton: React.FC = () => {
  return (
    <div className="tms-wrapper">

      {/* Controls Bar — mirrors .table-controls-bar */}
      <div className="tms-controls-bar">
        {/* Branch selector pill */}
        <div className="tms-shimmer tms-branch-pill" />
        {/* Status filter pill */}
        <div className="tms-shimmer tms-filter-pill" />
        {/* Action buttons pushed right */}
        <div className="tms-controls-actions">
          <div className="tms-shimmer tms-btn-outline" />
          <div className="tms-shimmer tms-btn-primary" />
        </div>
      </div>

      {/* Main content — mirrors .table-management-content */}
      <div className="tms-content">

        {/* Panel header label — mirrors .panel-header */}
        <div className="tms-panel-header">
          <div className="tms-shimmer tms-panel-title" />
        </div>

        {/* Location groups */}
        <div className="tms-locations">
          {[12, 8].map((cubeCount, gi) => (
            <div key={gi} className="tms-location-group">

              {/* Location header — mirrors .location-header */}
              <div className="tms-location-header">
                <div className="tms-shimmer tms-location-name" />
                <div className="tms-shimmer tms-location-count" />
              </div>

              {/* Cube grid — mirrors .location-tables-grid */}
              <div className="tms-cube-grid">
                {Array.from({ length: cubeCount }).map((_, i) => (
                  <div key={i} className="tms-shimmer tms-cube" />
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
