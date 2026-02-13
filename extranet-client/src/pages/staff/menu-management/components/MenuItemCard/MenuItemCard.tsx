import React from 'react';
import { CategoryId, getCategoryName } from '../../utils/category-helpers';
import './MenuItemCard.css';
import { MenuItem } from '../../types/menu.types';
import { Button } from '@/components/ui/Button';

interface MenuItemCardProps {
  item: MenuItem;
  categories: any[];
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onToggleAvailability: (itemId: string, currentStatus: boolean) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  return (
    <div className="menu-item-card" data-testid={`menu-item-${item._id}`}>
      {item.images?.length > 0 && (
        <div className="item-image-container">
          <img src={item.images[0]} alt={item.name} className="item-image" />
        </div>
      )}

      <div className="item-content">
        <div className="item-header">
          <h3 className="item-name" data-testid="item-name">
            {item.name}
          </h3>
          <button
            className={`availability-toggle ${item.isAvailable ? 'available' : 'unavailable'}`}
            onClick={() => onToggleAvailability(item._id, item.isAvailable)}
            data-testid="toggle-availability"
          >
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </button>
        </div>

        <p className="item-description">{item.description || 'No description'}</p>

        <div className="item-meta">
          <span className="item-category">
            {getCategoryName(item.categoryId as CategoryId, categories)}
          </span>
          {item.preparationTime && (
            <span className="item-prep-time">⏱️ {item.preparationTime} min</span>
          )}
        </div>

        <div className="item-pricing">
          <span className="current-price">${item.price.toFixed(2)}</span>
        </div>

        <div className="item-actions">
          <Button variant="outline" onClick={() => onEdit(item._id)} data-testid="edit-button">
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(item._id, item.name)}
            data-testid="delete-button"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};