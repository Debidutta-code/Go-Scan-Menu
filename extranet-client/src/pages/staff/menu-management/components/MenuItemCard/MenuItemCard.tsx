import React from 'react';
import { CategoryId, getCategoryName } from '../../utils/category-helpers';
import './MenuItemCard.css';
import { MenuItem } from '../../types/menu.types';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';

interface MenuItemCardProps {
  item: MenuItem;
  categories: any[];
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onToggleAvailability: (itemId: string, currentStatus: boolean) => void;
  isProcessing?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
  isProcessing = false,
}) => {
  return (
    <div className={`menu-item-card ${isProcessing ? 'processing' : ''}`} data-testid={`menu-item-${item._id}`}>
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
          <Switch
            id="toggle-availability"
            checked={item.isAvailable}
            onChange={() => onToggleAvailability(item._id, item.isAvailable)}
            label={item.isAvailable ? 'Available' : 'Unavailable'}
            disabled={isProcessing}
          />
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