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

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  categories,
  onEdit,
  onDelete,
  onToggleAvailability,
  viewMode = 'list',
}) => {
  const categoryName = getCategoryName(item.categoryId as CategoryId, categories);
  const hasDiscount = item.discountPrice !== undefined && item.discountPrice !== null;
  const dietaryIcon = item.dietaryType ? DietaryTypeIcons[item.dietaryType] : null;
  const dietaryLabel = item.dietaryType ? DietaryTypeLabels[item.dietaryType] : null;
  const thumbnail = item.images?.[0] || item.image;
  const isUnavailable = !item.isAvailable;

  if (viewMode === 'list') {
    return (
      <div
        className={`mic-list-row ${isUnavailable ? 'mic-row-unavailable' : ''} ${!item.isActive ? 'mic-row-inactive' : ''}`}
        data-testid={`menu-item-${item._id}`}
      >
        {/* Left accent stripe for unavailable */}
        {isUnavailable && <div className="mic-unavail-stripe" />}

        {/* Thumbnail */}
        <div className="mic-list-thumb">
          {thumbnail ? (
            <img src={thumbnail} alt={item.name} className="mic-list-thumb-img" />
          ) : (
            <div className="mic-list-thumb-placeholder">
              {item.itemType === 'drink' ? '🥤' : '🍽️'}
            </div>
          )}
        </div>

        {/* Name + Description */}
        <div className="mic-list-info">
          <div className="mic-list-name-row">
            <span className="mic-list-name" data-testid="item-name">{item.name}</span>
            {isUnavailable && (
              <span className="mic-badge mic-badge-unavailable">Unavailable</span>
            )}
            {!item.isActive && (
              <span className="mic-badge mic-badge-inactive">Inactive</span>
            )}
          </div>
          {item.description && (
            <span className="mic-list-desc">{item.description}</span>
          )}
        </div>

        {/* Category */}
        <div className="mic-list-cell mic-cell-category">
          <span className="mic-badge mic-badge-category">{categoryName}</span>
        </div>

        {/* Dietary type only — no food/drink type chip */}
        <div className="mic-list-cell mic-cell-dietary">
          {dietaryIcon ? (
            <span className="mic-dietary-pill" title={dietaryLabel || ''}>
              <span className="mic-dietary-icon">{dietaryIcon}</span>
              <span className="mic-dietary-label">{dietaryLabel}</span>
            </span>
          ) : (
            <span className="mic-no-dietary">—</span>
          )}
          {item.spiceLevel && (
            <span className="mic-spice-chip" title={`Spice: ${item.spiceLevel}`}>
              {SpiceIcons[item.spiceLevel]}
            </span>
          )}
        </div>

        {/* Extras count */}
        <div className="mic-list-cell mic-cell-extras">
          {item.variants?.length > 0 && (
            <span className="mic-mini-badge" title={`${item.variants.length} variant(s)`}>
              {item.variants.length}V
            </span>
          )}
          {item.addons?.length > 0 && (
            <span className="mic-mini-badge" title={`${item.addons.length} add-on(s)`}>
              {item.addons.length}A
            </span>
          )}
          {item.customizations?.length > 0 && (
            <span className="mic-mini-badge" title={`${item.customizations.length} customization(s)`}>
              {item.customizations.length}C
            </span>
          )}
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

        {/* Availability — toggle only, no label text */}
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
              label=""
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  // ---- GRID VIEW ----
  return (
    <div
      className={`mic-grid-card ${isUnavailable ? 'mic-grid-unavailable' : ''} ${!item.isActive ? 'mic-grid-inactive' : ''}`}
      data-testid={`menu-item-${item._id}`}
    >
      <div className="mic-grid-image">
        {thumbnail ? (
          <img src={thumbnail} alt={item.name} className={`mic-grid-img ${isUnavailable ? 'mic-img-dim' : ''}`} />
        ) : (
          <div className="mic-grid-img-placeholder">
            {item.itemType === 'drink' ? '🥤' : '🍽️'}
          </div>
        )}
        {isUnavailable && <div className="mic-grid-unavail-overlay" />}
        <div className="mic-grid-badges-overlay">
          {dietaryIcon && (
            <span className="mic-overlay-badge" title={dietaryLabel || ''}>{dietaryIcon}</span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {isUnavailable && <span className="mic-overlay-unavailable">Unavailable</span>}
            {!item.isActive && <span className="mic-overlay-inactive">Inactive</span>}
          </div>
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

        <div className="mic-grid-meta">
          <span className="mic-badge mic-badge-category">{categoryName}</span>
          {dietaryIcon && (
            <span className="mic-dietary-chip" title={dietaryLabel || ''}>{dietaryIcon}</span>
          )}
          {item.spiceLevel && (
            <span className="mic-spice-chip">{SpiceIcons[item.spiceLevel]}</span>
          )}
        </div>

        {(item.variants?.length > 0 || item.addons?.length > 0 || item.customizations?.length > 0) && (
          <div className="mic-grid-extras">
            {item.variants?.length > 0 && (
              <span className="mic-mini-badge">{item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}</span>
            )}
            {item.addons?.length > 0 && (
              <span className="mic-mini-badge">{item.addons.length} add-on{item.addons.length !== 1 ? 's' : ''}</span>
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
              <button className="mic-icon-btn mic-icon-btn-edit" onClick={() => onEdit(item._id)} data-testid="edit-button" title="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </PermissionGuard>
            <PermissionGuard permission="menu.delete" minLevel={RoleLevel.BRANCH_SINGLE}>
              <button className="mic-icon-btn mic-icon-btn-delete" onClick={() => onDelete(item._id, item.name)} data-testid="delete-button" title="Delete">
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
