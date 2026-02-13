// src/pages/staff/CategoryModalSkeleton.tsx
import React from 'react';
import './CategoryModalSkeleton.css';

export const CategoryModalSkeleton: React.FC = () => {
  return (
    <div className="category-modal-skeleton-wrapper">
      {/* Form Side Skeleton */}
      <div className="category-modal-skeleton-form-side">
        {/* Header Skeleton */}
        <div className="category-modal-skeleton-header">
          <div className="category-modal-skeleton-title"></div>
          <div className="category-modal-skeleton-subtitle"></div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="category-modal-skeleton-form">
          {/* Name Field */}
          <div className="category-modal-skeleton-field">
            <div className="category-modal-skeleton-label"></div>
            <div className="category-modal-skeleton-input"></div>
          </div>

          {/* Description Field */}
          <div className="category-modal-skeleton-field">
            <div className="category-modal-skeleton-label"></div>
            <div className="category-modal-skeleton-textarea"></div>
          </div>

          {/* Image Field */}
          <div className="category-modal-skeleton-field">
            <div className="category-modal-skeleton-label"></div>
            <div className="category-modal-skeleton-input"></div>
          </div>

          {/* Scope Field */}
          <div className="category-modal-skeleton-field">
            <div className="category-modal-skeleton-label"></div>
            <div className="category-modal-skeleton-select"></div>
          </div>

          {/* Checkbox Field */}
          <div className="category-modal-skeleton-field">
            <div className="category-modal-skeleton-checkbox-group">
              <div className="category-modal-skeleton-checkbox"></div>
              <div className="category-modal-skeleton-checkbox-label"></div>
            </div>
            <div className="category-modal-skeleton-help-text"></div>
          </div>

          {/* Buttons */}
          <div className="category-modal-skeleton-actions">
            <div className="category-modal-skeleton-button"></div>
            <div className="category-modal-skeleton-button"></div>
          </div>
        </div>
      </div>

      {/* Preview Side Skeleton */}
      <div className="category-modal-skeleton-preview-side">
        <div className="category-modal-skeleton-preview-header">
          <div className="category-modal-skeleton-preview-title"></div>
          <div className="category-modal-skeleton-preview-subtitle"></div>
        </div>

        <div className="category-modal-skeleton-preview-card-wrapper">
          <div className="category-modal-skeleton-preview-card">
            <div className="category-modal-skeleton-preview-image"></div>
            <div className="category-modal-skeleton-preview-content">
              <div className="category-modal-skeleton-preview-name"></div>
              <div className="category-modal-skeleton-preview-desc-1"></div>
              <div className="category-modal-skeleton-preview-desc-2"></div>
              <div className="category-modal-skeleton-preview-badges">
                <div className="category-modal-skeleton-preview-badge"></div>
                <div className="category-modal-skeleton-preview-badge"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
