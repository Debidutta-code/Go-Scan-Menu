import React from 'react';
import './MenuItemCardSkeleton.css';

interface MenuItemCardSkeletonProps {
  viewMode?: 'list' | 'grid';
  count?: number;
}

const ListRowSkeleton: React.FC = () => (
  <div className="mic-skel-list-row" aria-hidden="true">
    {/* Thumbnail */}
    <div className="mic-skel-thumb mic-skel-pulse" />

    {/* Name + Description */}
    <div className="mic-skel-info">
      <div className="mic-skel-name-row">
        <div className="mic-skel-block mic-skel-pulse" style={{ width: '55%', height: 13 }} />
        <div className="mic-skel-block mic-skel-pulse" style={{ width: 52, height: 18, borderRadius: 20 }} />
      </div>
      <div className="mic-skel-block mic-skel-pulse" style={{ width: '80%', height: 11, marginTop: 5 }} />
    </div>

    {/* Category */}
    <div className="mic-skel-cell">
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 80, height: 20, borderRadius: 20 }} />
    </div>

    {/* Type / Dietary */}
    <div className="mic-skel-cell" style={{ gap: 6 }}>
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 64, height: 22, borderRadius: 20 }} />
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 22, height: 22, borderRadius: '50%' }} />
    </div>

    {/* Extras */}
    <div className="mic-skel-cell" style={{ gap: 4 }}>
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 28, height: 18, borderRadius: 4 }} />
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 28, height: 18, borderRadius: 4 }} />
    </div>

    {/* Price */}
    <div className="mic-skel-cell mic-skel-cell-col">
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 52, height: 14 }} />
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 38, height: 11, marginTop: 3 }} />
    </div>

    {/* Availability */}
    <div className="mic-skel-cell">
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 40, height: 22, borderRadius: 12 }} />
    </div>

    {/* Actions */}
    <div className="mic-skel-cell mic-skel-cell-end" style={{ gap: 6 }}>
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 58, height: 28, borderRadius: 6 }} />
      <div className="mic-skel-block mic-skel-pulse" style={{ width: 62, height: 28, borderRadius: 6 }} />
    </div>
  </div>
);

const GridCardSkeleton: React.FC = () => (
  <div className="mic-skel-grid-card" aria-hidden="true">
    {/* Image area with overlay placeholder */}
    <div className="mic-skel-grid-image mic-skel-pulse">
      {/* Dietary pill top-left, matching mic-overlay-dietary */}
      <div className="mic-skel-grid-overlay">
        <div className="mic-skel-block mic-skel-overlay-dietary" style={{ background: 'rgba(255,255,255,0.45)', animation: 'none' }} />
      </div>
    </div>

    {/* Body */}
    <div className="mic-skel-grid-body">
      {/* Name + toggle */}
      <div className="mic-skel-grid-top">
        <div className="mic-skel-block mic-skel-pulse" style={{ flex: 1, height: 13 }} />
        <div className="mic-skel-block mic-skel-pulse" style={{ width: 34, height: 20, borderRadius: 12, flexShrink: 0 }} />
      </div>

      {/* Description */}
      <div className="mic-skel-block mic-skel-pulse" style={{ width: '90%', height: 11, marginTop: 2 }} />

      {/* Spice chip (dietary moved to image overlay) */}
      <div className="mic-skel-grid-meta">
        <div className="mic-skel-block mic-skel-pulse" style={{ width: 70, height: 20, borderRadius: 20 }} />
      </div>

      {/* Extras */}
      <div className="mic-skel-grid-meta" style={{ gap: 4 }}>
        <div className="mic-skel-block mic-skel-pulse" style={{ width: 62, height: 16, borderRadius: 4 }} />
      </div>

      {/* Footer */}
      <div className="mic-skel-grid-footer">
        <div className="mic-skel-block mic-skel-pulse" style={{ width: 52, height: 14 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          <div className="mic-skel-block mic-skel-pulse" style={{ width: 28, height: 28, borderRadius: 6 }} />
          <div className="mic-skel-block mic-skel-pulse" style={{ width: 28, height: 28, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  </div>
);

export const MenuItemCardSkeleton: React.FC<MenuItemCardSkeletonProps> = ({
  viewMode = 'list',
  count = 5,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (viewMode === 'list') {
    return (
      <div className="mic-list-table" role="status" aria-label="Loading menu items">
        {/* Matching header */}
        <div className="mic-list-header">
          <div className="mic-list-header-cell" />
          <div className="mic-list-header-cell">Item</div>
          <div className="mic-list-header-cell">Category</div>
          <div className="mic-list-header-cell">Type / Dietary</div>
          <div className="mic-list-header-cell">Extras</div>
          <div className="mic-list-header-cell">Price</div>
          <div className="mic-list-header-cell">Availability</div>
          <div className="mic-list-header-cell" style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {items.map((i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="menu-items-grid"
      role="status"
      aria-label="Loading menu items"
    >
      {items.map((i) => (
        <GridCardSkeleton key={i} />
      ))}
    </div>
  );
};