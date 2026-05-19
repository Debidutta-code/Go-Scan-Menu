import React from 'react';
import { CategoryId, getCategoryName } from '@/modules/menu/pages/utils/category-helpers';
import './MenuItemCard.css';
import { MenuItem, DietaryTypeIcons, DietaryTypeLabels } from '@/shared/types/menu.types';
import { Switch } from '@/shared/components/Switch';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { RoleLevel, StaffRole } from '@/shared/types/role.types';

interface MenuItemCardProps {
  item: MenuItem;
  categories: any[];
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onToggleAvailability: (itemId: string, currentStatus: boolean) => void;
  viewMode?: 'list' | 'grid';
}

const SpiceIcons: Record<string, string> = {
  mild: '🌶️',
  medium: '🌶️🌶️',
  hot: '🌶️🌶️🌶️',
  extra_hot: '🌶️🌶️🌶️🌶️',
};

const SpiceLabels: Record<string, string> = {
  mild: 'Mild',
  medium: 'Medium',
  hot: 'Hot',
  extra_hot: 'Extra Hot',
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
  viewMode = 'list',
}) => {
  const hasDiscount = item.discountPrice !== undefined && item.discountPrice !== null;
  const dietaryIcon = item.dietaryType ? DietaryTypeIcons[item.dietaryType] : null;
  const dietaryLabel = item.dietaryType ? DietaryTypeLabels[item.dietaryType] : null;
  const thumbnail = item.images?.[0] || item.image;

  const variantCount = item.variants?.length ?? 0;
  const addonCount = item.addons?.length ?? 0;
  const customCount = item.customizations?.length ?? 0;

  if (viewMode === 'list') {
    return (
      <div
        className={`mic-list-row ${!item.isActive ? 'mic-inactive' : ''}`}
        data-testid={`menu-item-${item._id}`}
      >
        {/* Thumbnail — dietary icon overlay top-left */}
        <div className="mic-list-thumb">
          {thumbnail ? (
            <img src={thumbnail} alt={item.name} className="mic-list-thumb-img" />
          ) : (
            <div className="mic-list-thumb-placeholder">
              {item.itemType === 'drink' ? '🥤' : '🍽️'}
            </div>
          )}
          {dietaryIcon && (
            <span className="mic-list-thumb-dietary" title={dietaryLabel || ''}>
              {dietaryIcon}
            </span>
          )}
        </div>

        {/* Name + Description + tags */}
        <div className="mic-list-info">
          <div className="mic-list-name-row">
            <span className="mic-list-name" data-testid="item-name">
              {item.name}
            </span>
            {!item.isActive && <span className="mic-badge mic-badge-inactive">Inactive</span>}
          </div>
          {item.description && (
            <span className="mic-list-desc">{item.description}</span>
          )}
          <div className="mic-list-tags">
            {item.spiceLevel && (
              <span className="mic-tag mic-tag-spice" title={`Spice: ${SpiceLabels[item.spiceLevel]}`}>
                {SpiceIcons[item.spiceLevel]} {SpiceLabels[item.spiceLevel]}
              </span>
            )}
            {item.allergens?.slice(0, 2).map((a) => (
              <span key={a} className="mic-tag mic-tag-allergen" title={`Allergen: ${a}`}>
                ⚠ {a}
              </span>
            ))}
            {(item.allergens?.length ?? 0) > 2 && (
              <span className="mic-tag mic-tag-allergen">+{item.allergens!.length - 2} more</span>
            )}
          </div>
        </div>

        {/* Extras */}
        <div className="mic-list-cell mic-cell-extras">
          {variantCount > 0 && (
            <span className="mic-extra-badge" title={`${variantCount} variant${variantCount !== 1 ? 's' : ''}`}>
              {variantCount} variant{variantCount !== 1 ? 's' : ''}
            </span>
          )}
          {addonCount > 0 && (
            <span className="mic-extra-badge" title={`${addonCount} add-on${addonCount !== 1 ? 's' : ''}`}>
              {addonCount} add-on{addonCount !== 1 ? 's' : ''}
            </span>
          )}
          {customCount > 0 && (
            <span className="mic-extra-badge" title={`${customCount} customisation${customCount !== 1 ? 's' : ''}`}>
              {customCount} custom
            </span>
          )}
          {item.nutritionTags?.slice(0, 1).map((n) => (
            <span key={n} className="mic-extra-badge mic-extra-badge-nutrition">
              {n.replace(/_/g, ' ').toLowerCase()}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mic-list-cell mic-cell-price">
          {hasDiscount ? (
            <>
              <span className="mic-price-discount">${item.discountPrice!.toFixed(2)}</span>
              <span className="mic-price-original">${item.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="mic-price-main">${item.price.toFixed(2)}</span>
          )}
        </div>

        {/* Availability */}
        <div className="mic-list-cell mic-cell-avail">
          <PermissionGuard
            requiredRole={[StaffRole.KITCHEN_STAFF]}
            minLevel={RoleLevel.OPERATIONAL}
            permission="menu.update"
          >
            <Switch
              id={`toggle-${item._id}`}
              checked={item.isAvailable}
              onChange={() => onToggleAvailability(item._id, item.isAvailable)}
            />
          </PermissionGuard>
        </div>

        {/* Actions */}
        <div className="mic-list-cell mic-cell-actions">
          <PermissionGuard permission="menu.update" minLevel={RoleLevel.BRANCH_SINGLE}>
            <button
              className="mic-icon-btn mic-icon-btn-edit"
              onClick={() => onEdit(item._id)}
              title="Edit item"
              data-testid="edit-button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          </PermissionGuard>
          <PermissionGuard permission="menu.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
            <button
              className="mic-icon-btn mic-icon-btn-delete"
              onClick={() => onDelete(item._id, item.name)}
              title="Delete item"
              data-testid="delete-button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          </PermissionGuard>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={`mic-grid-card ${!item.isActive ? 'mic-inactive' : ''}`}
      data-testid={`menu-item-${item._id}`}
    >
      <div className="mic-grid-image">
        {thumbnail ? (
          <img src={thumbnail} alt={item.name} className="mic-grid-img" />
        ) : (
          <div className="mic-grid-img-placeholder">
            {item.itemType === 'drink' ? '🥤' : '🍽️'}
          </div>
        )}

        {/* Overlay: dietary top-left, inactive top-right */}
        <div className="mic-grid-badges-overlay">
          {dietaryIcon ? (
            <span className="mic-overlay-dietary" title={dietaryLabel || ''}>
              {dietaryIcon}
            </span>
          ) : (
            <span className="mic-overlay-spacer" />
          )}
          {!item.isActive && (
            <span className="mic-overlay-inactive">Inactive</span>
          )}
        </div>
      </div>

      <div className="mic-grid-body">
        <div className="mic-grid-top">
          <span className="mic-grid-name" data-testid="item-name">{item.name}</span>
          <PermissionGuard
            requiredRole={[StaffRole.KITCHEN_STAFF]}
            minLevel={RoleLevel.OPERATIONAL}
            permission="menu.update"
          >
            <Switch
              id={`toggle-${item._id}`}
              checked={item.isAvailable}
              onChange={() => onToggleAvailability(item._id, item.isAvailable)}
              label=""
            />
          </PermissionGuard>
        </div>

        {item.description && (
          <p className="mic-grid-desc">{item.description}</p>
        )}

        {/* Spice + allergens */}
        {(item.spiceLevel || (item.allergens?.length ?? 0) > 0) && (
          <div className="mic-grid-tags">
            {item.spiceLevel && (
              <span className="mic-tag mic-tag-spice">
                {SpiceIcons[item.spiceLevel]} {SpiceLabels[item.spiceLevel]}
              </span>
            )}
            {item.allergens?.slice(0, 1).map((a) => (
              <span key={a} className="mic-tag mic-tag-allergen">⚠ {a}</span>
            ))}
            {(item.allergens?.length ?? 0) > 1 && (
              <span className="mic-tag mic-tag-allergen">+{item.allergens!.length - 1} more</span>
            )}
          </div>
        )}

        {/* Extras */}
        {(variantCount > 0 || addonCount > 0 || customCount > 0) && (
          <div className="mic-grid-extras">
            {variantCount > 0 && (
              <span className="mic-extra-badge">{variantCount} variant{variantCount !== 1 ? 's' : ''}</span>
            )}
            {addonCount > 0 && (
              <span className="mic-extra-badge">{addonCount} add-on{addonCount !== 1 ? 's' : ''}</span>
            )}
            {customCount > 0 && (
              <span className="mic-extra-badge">{customCount} custom</span>
            )}
          </div>
        )}

        <div className="mic-grid-footer">
          <div className="mic-grid-price">
            {hasDiscount ? (
              <>
                <span className="mic-price-discount">${item.discountPrice!.toFixed(2)}</span>
                <span className="mic-price-original">${item.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="mic-price-main">${item.price.toFixed(2)}</span>
            )}
          </div>
          <div className="mic-grid-actions">
            <PermissionGuard permission="menu.update" minLevel={RoleLevel.BRANCH_SINGLE}>
              <button
                className="mic-icon-btn mic-icon-btn-edit"
                onClick={() => onEdit(item._id)}
                data-testid="edit-button"
                title="Edit"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </PermissionGuard>
            <PermissionGuard permission="menu.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
              <button
                className="mic-icon-btn mic-icon-btn-delete"
                onClick={() => onDelete(item._id, item.name)}
                data-testid="delete-button"
                title="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </div>
  );
};
