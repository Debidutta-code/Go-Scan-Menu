// src/pages/staff/TableManagementSkeleton.tsx
import React from 'react';
import './TableManagementSkeleton.css';

export const TableManagementSkeleton: React.FC = () => {
  return (
    <div className="tms-wrapper">

      {/* Panel header label — mirrors .panel-header */}
      <div className="tms-panel-header">
        <div className="tms-shimmer tms-panel-title" />
      </div>

      {/* Location groups — mirrors .tables-by-location */}
      <div className="tms-locations">

        {[12, 8].map((cubeCount, gi) => (
          <div key={gi} className="tms-location-group">

            {/* Location header row — mirrors .location-header */}
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
  );
};