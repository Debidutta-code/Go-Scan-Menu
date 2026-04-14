import React from 'react';
import { CategoryId, getCategoryName } from '@/modules/menu/pages/utils/category-helpers';
import './MenuItemCard.css';
import { MenuItem } from '@/shared/types/menu.types';
import { Button } from '@/shared/components/Button';
import { Switch } from '@/shared/components/Switch';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { RoleLevel, StaffRole } from '@/shared/types/role.types';

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
          <PermissionGuard
            requiredRole={[StaffRole.KITCHEN_STAFF]}
            minLevel={RoleLevel.OPERATIONAL}
            permission="menu.update"
          >
            <Switch
              id="toggle-availability"
              checked={item.isAvailable}
              onChange={() => onToggleAvailability(item._id, item.isAvailable)}
              label={item.isAvailable ? 'Available' : 'Unavailable'}
            />
          </PermissionGuard>
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
          <PermissionGuard permission="menu.update" minLevel={RoleLevel.BRANCH_SINGLE}>
            <Button variant="outline" onClick={() => onEdit(item._id)} data-testid="edit-button">
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="menu.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
            <Button
              variant="danger"
              onClick={() => onDelete(item._id, item.name)}
              data-testid="delete-button"
            >
              Delete
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
};