import React from 'react';
import { MenuItem } from '@/public-app/types/menu.types';
import { formatPrice, getSpiceLevelEmoji, getDietaryIcon } from '@/public-app/utils/formatters';
import './MenuItemCard.css';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  onItemClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency,
  onItemClick,
}) => {
  return (
    <div
      className={`menu-item-card-horizontal ${!item.isAvailable ? 'unavailable' : ''}`}
      onClick={() => onItemClick(item)}
    >
      <div className="menu-item-card-image-wrapper">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="menu-item-card-image-horizontal"
            loading="lazy"
          />
        ) : (
          <div className="menu-item-card-image-placeholder-horizontal">
            <span>🍽️</span>
          </div>
        )}
        {item.dietaryType && (
          <div className={`menu-item-dietary-badge ${item.dietaryType.toLowerCase()}`}>
            {getDietaryIcon(item.dietaryType)}
          </div>
        )}
        {!item.isAvailable && (
          <div className="menu-item-card-unavailable-overlay">N/A</div>
        )}
      </div>

      <div className="menu-item-card-info-horizontal">
        <div className="menu-item-card-top-row">
          <div className="menu-item-card-text-content">
            <h3 className="menu-item-card-name-horizontal">{item.name}</h3>
            {item.description && (
              <p className="menu-item-card-description-horizontal">
                {item.description}
              </p>
            )}

            <div className="menu-item-card-meta-horizontal">
              {item.preparationTime && (
                <span className="menu-item-card-meta-badge">
                  ⏱️ {item.preparationTime}min
                </span>
              )}
              {item.calories && (
                <span className="menu-item-card-meta-badge">
                  {item.calories} cal
                </span>
              )}
              {item.spiceLevel && (
                <span className="menu-item-card-meta-badge">
                  {getSpiceLevelEmoji(item.spiceLevel)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="menu-item-card-bottom-row">
          <div className="menu-item-card-price-horizontal">
            {item.discountPrice ? (
              <>
                <span className="menu-item-card-discount-price-horizontal">
                  {formatPrice(item.discountPrice, currency)}
                </span>
                <span className="menu-item-card-original-price-horizontal">
                  {formatPrice(item.price, currency)}
                </span>
              </>
            ) : (
              <span className="menu-item-card-current-price-horizontal">
                {formatPrice(item.price, currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
