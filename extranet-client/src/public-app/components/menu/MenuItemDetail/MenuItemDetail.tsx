import React, { useState } from 'react';
import { MenuItem, Variant } from '../../../types/menu.types';
import { formatPrice, getSpiceLevelEmoji } from '../../../utils/formatters';
import './MenuItemDetail.css';

interface MenuItemDetailProps {
  item: MenuItem;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, variant?: Variant, quantity?: number) => void;
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
    onAddToCart(item, selectedVariant, quantity);
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
      <div className="menu-detail-overlay" onClick={onClose}></div>
      <div className={`menu-detail-drawer ${isOpen ? 'open' : ''}`}>
        <div className="menu-detail-header">
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="menu-detail-content">
          {images.length > 0 && (
            <div className="menu-detail-image-section">
              <img src={images[currentImageIndex]} alt={item.name} className="menu-detail-image" />
              {images.length > 1 && (
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`image-indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="menu-detail-info">
            <div className="menu-detail-title-section">
              <h2 className="menu-detail-title">{item.name}</h2>
              {item.tags && item.tags.length > 0 && (
                <div className="menu-detail-tags">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="detail-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {item.description && <p className="menu-detail-description">{item.description}</p>}

            <div className="menu-detail-meta-grid">
              {item.preparationTime && (
                <div className="meta-detail-item">
                  <span className="meta-detail-icon">⏱️</span>
                  <span className="meta-detail-text">{item.preparationTime} min</span>
                </div>
              )}
              {item.calories && (
                <div className="meta-detail-item">
                  <span className="meta-detail-icon">🔥</span>
                  <span className="meta-detail-text">{item.calories} cal</span>
                </div>
              )}
              {item.spiceLevel && (
                <div className="meta-detail-item">
                  <span className="meta-detail-icon">{getSpiceLevelEmoji(item.spiceLevel)}</span>
                  <span className="meta-detail-text">
                    {item.spiceLevel.charAt(0).toUpperCase() + item.spiceLevel.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {item.allergens && item.allergens.length > 0 && (
              <div className="allergen-section">
                <h3 className="allergen-title">⚠️ Allergen Information</h3>
                <p className="allergen-text">{item.allergens.join(', ')}</p>
              </div>
            )}

            {item.variants && item.variants.length > 0 && (
              <div className="variant-section">
                <h3 className="variant-title">Choose Size</h3>
                <div className="variant-options">
                  {item.variants.map((variant) => (
                    <button
                      key={variant._id}
                      className={`variant-option ${selectedVariant?._id === variant._id ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <span className="variant-name">{variant.name}</span>
                      <span className="variant-price">{formatPrice(variant.price, currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="menu-detail-footer">
          <div className="quantity-selector">
            <button
              className="quantity-btn"
              onClick={decrementQuantity}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={incrementQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className="add-to-cart-btn"
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
