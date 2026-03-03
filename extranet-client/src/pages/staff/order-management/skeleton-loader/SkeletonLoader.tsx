// ./skeleton-loader/SkeletonLoader.tsx
import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  variant?: 'table-row' | 'stats-card' | 'detail-panel' | 'text' | 'circle';
  count?: number;           // how many rows/cards to show
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * Reusable skeleton loading placeholder
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
  width,
  height,
  className = '',
}) => {
  if (count <= 0) return null;

  const items = Array.from({ length: count });

  if (variant === 'table-row') {
    return (
      <>
        {items.map((_, i) => (
          <tr key={i} className="skeleton-row">
            <td><div className="skeleton skeleton-text-short" /></td>
            <td><div className="skeleton skeleton-pill" /></td>
            <td><div className="skeleton skeleton-text-short" /></td>
            <td><div className="skeleton skeleton-text-short" /></td>
            <td><div className="skeleton skeleton-text-medium" /></td>
            <td><div className="skeleton skeleton-badge" /></td>
            <td><div className="skeleton skeleton-badge" /></td>
            <td>
              <div className="skeleton-time">
                <div className="skeleton skeleton-text-tiny" />
                <div className="skeleton skeleton-text-tiny" />
              </div>
            </td>
            <td><div className="skeleton skeleton-icon-btn" /></td>
          </tr>
        ))}
      </>
    );
  }

  if (variant === 'stats-card') {
    return (
      <>
        {items.map((_, i) => (
          <div key={i} className="summary-card skeleton-stats-card">
            <div className="summary-icon skeleton-circle" />
            <div className="summary-content">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-label" />
              <div className="skeleton skeleton-sub" />
            </div>
          </div>
        ))}
      </>
    );
  }

  // fallback / simple shapes
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <>
      {items.map((_, i) => {
        if (variant === 'circle') {
          return <div key={i} className={`skeleton skeleton-circle ${className}`} style={style} />;
        }
        if (variant === 'detail-panel') {
          return (
            <div key={i} className={`skeleton-detail-panel ${className}`}>
              <div className="skeleton skeleton-header" />
              <div className="skeleton skeleton-meta-row" />
              <div className="skeleton skeleton-section-title" />
              <div className="skeleton skeleton-item-row" style={{ height: '68px' }} />
              <div className="skeleton skeleton-item-row" style={{ height: '68px' }} />
              <div className="skeleton skeleton-item-row" style={{ height: '48px' }} />
            </div>
          );
        }
        // default: text line
        return <div key={i} className={`skeleton skeleton-text ${className}`} style={style} />;
      })}
    </>
  );
};