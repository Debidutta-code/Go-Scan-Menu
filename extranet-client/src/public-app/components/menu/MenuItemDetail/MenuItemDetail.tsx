import React, { useState } from 'react';
import { MenuItem, Variant } from '../../../types/menu.types';
import { formatPrice, getSpiceLevelEmoji } from '../../../utils/formatters';
import './MenuItemDetail.css';

interface MenuItemDetailProps {
  item: MenuItem;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, variant?: Variant, addons?: any[], quantity?: number) => void;
}

export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  currency,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    item.variants?.find((v) => v.isDefault) || item.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];

  const handleAddToCart = () => {
    onAddToCart(item, selectedVariant, [], quantity);
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const getCurrentPrice = () => {
    if (selectedVariant) return selectedVariant.price;
    return item.discountPrice || item.price;
  };

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
              <img
                src={images[currentImageIndex]}
                alt={item.name}
                className="menu-item-details-image"
              />
              {images.length > 1 && (
                <div className="menu-item-details-image-indicators">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`menu-item-details-image-indicator ${index === currentImageIndex ? 'active' : ''
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="menu-item-details-info">
            <div className="menu-item-details-title-section">
              <h2 className="menu-item-details-title">{item.name}</h2>
              {item.tags && item.tags.length > 0 && (
                <div className="menu-item-details-tags">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="menu-item-details-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {item.description && (
              <p className="menu-item-details-description">{item.description}</p>
            )}

            <div className="menu-item-details-meta-grid">
              {item.preparationTime && (
                <div className="menu-item-details-meta-item">
                  <span className="menu-item-details-meta-icon">⏱️</span>
                  <span className="menu-item-details-meta-text">
                    {item.preparationTime} min
                  </span>
                </div>
              )}
              {item.calories && (
                <div className="menu-item-details-meta-item">
                  <span className="menu-item-details-meta-icon">🔥</span>
                  <span className="menu-item-details-meta-text">{item.calories} cal</span>
                </div>
              )}
              {item.spiceLevel && (
                <div className="menu-item-details-meta-item">
                  <span className="menu-item-details-meta-icon">
                    {getSpiceLevelEmoji(item.spiceLevel)}
                  </span>
                  <span className="menu-item-details-meta-text">
                    {item.spiceLevel.charAt(0).toUpperCase() + item.spiceLevel.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div className="menu-item-details-allergen-section">
                <h3 className="menu-item-details-allergen-title">⚠️ Allergen Information</h3>
                <p className="menu-item-details-allergen-text">
                  {item.allergens.join(', ')}
                </p>
              </div>
            )}

            {item.variants && item.variants.length > 0 && (
              <div className="menu-item-details-variant-section">
                <h3 className="menu-item-details-variant-title">Choose Size</h3>
                <div className="menu-item-details-variant-options">
                  {item.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={`menu-item-details-variant-option ${selectedVariant?._id === variant._id ? 'active' : ''
                        }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <span className="menu-item-details-variant-name">{variant.name}</span>
                      <span className="menu-item-details-variant-price">
                        {formatPrice(variant.price, currency)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="menu-item-details-footer">
          <div className="menu-item-details-quantity-selector">
            <button
              className="menu-item-details-quantity-btn"
              onClick={decrementQuantity}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="menu-item-details-quantity-value">{quantity}</span>
            <button
              className="menu-item-details-quantity-btn"
              onClick={incrementQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="menu-item-details-add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
          >
            {item.isAvailable ? (
              <>Add to Cart • {formatPrice(getCurrentPrice() * quantity, currency)}</>
            ) : (
              'Not Available'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
