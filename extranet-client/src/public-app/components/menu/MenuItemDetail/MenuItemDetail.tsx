import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuItem, ModifierGroup, ModifierOption } from '@/public-app/types/menu.types';
import { formatPrice, getSpiceLevelEmoji, getDietaryIcon } from '@/public-app/utils/formatters';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when item changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [item._id, isOpen]);

  const images =
    item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];

  if (!isOpen) return null;

  return (
    <>
      <div className="menu-item-details-overlay" onClick={onClose}></div>
      <div className={`menu-item-details-drawer ${isOpen ? 'open' : ''}`}>
        <button className="menu-item-details-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

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
            </div>

            {item.description && <p className="menu-item-details-description">{item.description}</p>}

            {/* Render Modifier Groups as info */}
            {(item.modifierGroups || []).map((group: any) => (
              <div key={group._id} className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">
                  {group.name}
                  <span className="type-info-badge">{group.type === 'size' ? 'Available Sizes' : 'Options'}</span>
                </h3>
                {group.description && <p className="field-help-text">{group.description}</p>}

                <div className="modifier-info-list">
                  {group.options.map((option: any) => (
                    <div key={option._id} className="menu-item-details-info-item">
                      <span className="info-item-name">{option.name}</span>
                      <span className="info-item-price">
                        {option.price > 0 ? formatPrice(option.price, currency) : 'Free'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Legacy Variants if any */}
            {(item.variants || []).length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">Variants</h3>
                <div className="modifier-info-list">
                  {item.variants?.map((variant) => (
                    <div key={variant._id} className="menu-item-details-info-item">
                      <span className="info-item-name">{variant.name}</span>
                      <span className="info-item-price">{formatPrice(variant.price, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {(item.addons || []).length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">Add-ons</h3>
                <div className="modifier-info-list">
                  {item.addons?.map((addon) => (
                    <div key={addon._id} className="menu-item-details-info-item">
                      <span className="info-item-name">{addon.name}</span>
                      <span className="info-item-price">+{formatPrice(addon.price, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="menu-item-details-footer">
          <div className="menu-item-details-price-display">
            {item.isAvailable ? (
              <span className="current-price">Base Price: {formatPrice(item.discountPrice || item.price, currency)}</span>
            ) : (
              <span className="not-available">Not Available</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
