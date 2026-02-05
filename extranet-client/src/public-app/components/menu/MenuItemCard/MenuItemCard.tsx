import React from 'react';
import { MenuItem } from '../../../types/menu.types';
import { formatPrice, getSpiceLevelEmoji } from '../../../utils/formatters';
import './MenuItemCard.css';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  onItemClick: (item: MenuItem) => void;
  onAddClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currency,
  onItemClick,
  onAddClick,
}) => {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddClick(item);
  };

  return (
    <div
      className={`menu-item-card-horizontal ${!item.isAvailable ? 'unavailable' : ''}`}
      onClick={() => onItemClick(item)}
    >
      <div className="menu-item-image-wrapper">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="menu-item-image-horizontal"
            loading="lazy"
          />
        ) : (
          <div className="menu-item-image-placeholder-horizontal">
            <span>🍽️</span>
          </div>
        )}
        {!item.isAvailable && <div className="unavailable-overlay-small">N/A</div>}
      </div>

      <div className="menu-item-info-horizontal">
        <div className="menu-item-top-row">
          <div className="menu-item-text-content">
            <h3 className="menu-item-name-horizontal">{item.name}</h3>
            {item.description && (
              <p className="menu-item-description-horizontal">{item.description}</p>
            )}

            <div className="menu-item-meta-horizontal">
              {item.preparationTime && (
                <span className="meta-badge">⏱️ {item.preparationTime}min</span>
              )}
              {item.calories && <span className="meta-badge">{item.calories} cal</span>}
              {item.spiceLevel && (
                <span className="meta-badge">{getSpiceLevelEmoji(item.spiceLevel)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="menu-item-bottom-row">
          <div className="menu-item-price-horizontal">
            {item.discountPrice ? (
              <>
                <span className="discount-price-horizontal">
                  {formatPrice(item.discountPrice, currency)}
                </span>
                <span className="original-price-horizontal">
                  {formatPrice(item.price, currency)}
                </span>
              </>
            ) : (
              <span className="current-price-horizontal">{formatPrice(item.price, currency)}</span>
            )}
          </div>

          {item.isAvailable && (
            <div className="quantity-control">
              <button className="quantity-btn-minus" onClick={handleAddClick}>
                −
              </button>
              <span className="quantity-display">1</span>
              <button className="quantity-btn-plus" onClick={handleAddClick}>
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
