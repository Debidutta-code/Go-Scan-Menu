import React, { useState } from 'react';
import { MenuItem } from '@/public-app/types/menu.types';
import { formatPrice, getDietaryIcon } from '@/public-app/utils/formatters';
import './MenuItemDetail.css';

interface MenuItemDetailProps {
  item: MenuItem;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  currency,
  isOpen,
  onClose,
}) => {
  const [currentImageIndex] = useState(0);

  const images =
    item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];

  if (!isOpen) return null;

  return (
    <>
      <div className="menu-item-details-overlay" onClick={onClose}></div>
      <div className={`menu-item-details-drawer ${isOpen ? 'open' : ''}`}>
        <div className="menu-item-details-header">
          <button className="menu-item-details-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="menu-item-details-content">
          {images.length > 0 && (
            <div className="menu-item-details-image-section">
              <img src={images[currentImageIndex]} alt={item.name} className="menu-item-details-image" />
            </div>
          )}

          <div className="menu-item-details-info">
            <div className="menu-item-details-title-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="menu-item-details-title">{item.name}</h2>
                {item.dietaryType && (
                  <span title={item.dietaryType} style={{ fontSize: '20px' }}>
                    {getDietaryIcon(item.dietaryType)}
                  </span>
                )}
              </div>
              <div className="menu-item-details-price">
                {formatPrice(item.discountPrice || item.price, currency)}
              </div>
            </div>

            {item.description && <p className="menu-item-details-description">{item.description}</p>}
          </div>
        </div>
      </div>
    </>
  );
};
