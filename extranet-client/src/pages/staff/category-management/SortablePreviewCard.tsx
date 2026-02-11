// src/pages/staff/SortablePreviewCard.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category } from '../../../types/menu.types';

interface SortablePreviewCardProps {
  category: Category;
  isLarge: boolean;
}

export const SortablePreviewCard: React.FC<SortablePreviewCardProps> = ({
  category,
  isLarge,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`category-preview-card ${isLarge ? 'large' : 'small'} ${
        isDragging ? 'dragging' : ''
      }`}
    >
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="category-preview-image"
          draggable={false}
        />
      ) : (
        <div className="category-preview-placeholder">
          <span className="category-preview-placeholder-icon">🍴</span>
        </div>
      )}
      <div className="category-preview-overlay">
        <h3 className="category-preview-name">{category.name}</h3>
        <p className="category-preview-count">View items</p>
      </div>
    </div>
  );
};
