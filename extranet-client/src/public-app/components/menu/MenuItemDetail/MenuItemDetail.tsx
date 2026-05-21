import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Variant, Addon } from '@/public-app/types/menu.types';
import { formatPrice, getSpiceLevelEmoji, getDietaryIcon } from '@/public-app/utils/formatters';
import './MenuItemDetail.css';

interface MenuItemDetailProps {
  item: MenuItem;
  currency: string;
  isOpen: boolean;
  mode?: 'view' | 'customize';
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    variant?: Variant,
    addons?: Addon[],
    quantity?: number,
    customizations?: { name: string; value: string }[]
  ) => void;
}

export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  item,
  currency,
  isOpen,
  mode = 'view',
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    item.variants?.find((v) => v.isDefault) || item.variants?.[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when item or mode changes
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(item.variants?.find((v) => v.isDefault) || item.variants?.[0]);
      setSelectedAddons([]);
      setSelectedCustomizations({});
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [item._id, isOpen, mode]);

  const images =
    item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a._id === addon._id)
        ? prev.filter((a) => a._id !== addon._id)
        : [...prev, addon]
    );
  };

  const handleCustomizationChange = (name: string, value: string) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isAddDisabled = useMemo(() => {
    if (!item.isAvailable) return true;
    if (!item.customizations) return false;

    return item.customizations.some(
      (c) => c.isRequired && !selectedCustomizations[c.name]
    );
  }, [item.isAvailable, item.customizations, selectedCustomizations]);

  const handleAddToCart = () => {
    const customizationsArray = Object.entries(selectedCustomizations).map(([name, value]) => ({
      name,
      value,
    }));
    onAddToCart(item, selectedVariant, selectedAddons, quantity, customizationsArray);
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const getCurrentPrice = () => {
    let basePrice = selectedVariant ? selectedVariant.price : (item.discountPrice || item.price);
    const addonsPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    return basePrice + addonsPrice;
  };

  if (!isOpen) return null;

  const isCustomizeMode = mode === 'customize';

  return (
    <>
      <div className="menu-item-details-overlay" onClick={onClose}></div>
      <div className={`menu-item-details-drawer ${isOpen ? 'open' : ''} ${isCustomizeMode ? 'customize-mode' : ''}`}>
        <div className="menu-item-details-header">
          <button className="menu-item-details-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
          {isCustomizeMode && <h2 className="menu-item-details-header-title">Customize Item</h2>}
        </div>

        <div className="menu-item-details-content">
          {!isCustomizeMode && images.length > 0 && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="menu-item-details-title">{item.name}</h2>
                {item.dietaryType && (
                  <span title={item.dietaryType} style={{ fontSize: '20px' }}>
                    {getDietaryIcon(item.dietaryType)}
                  </span>
                )}
              </div>
              {!isCustomizeMode && item.tags && item.tags.length > 0 && (
                <div className="menu-item-details-tags">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="menu-item-details-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!isCustomizeMode && item.description && (
              <p className="menu-item-details-description">{item.description}</p>
            )}

            {!isCustomizeMode && (
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
            )}

            {!isCustomizeMode && item.allergens && item.allergens.length > 0 && (
              <div className="menu-item-details-allergen-section">
                <h3 className="menu-item-details-allergen-title">⚠️ Allergen Information</h3>
                <p className="menu-item-details-allergen-text">
                  {item.allergens.join(', ')}
                </p>
              </div>
            )}

            {/* Variants */}
            {item.variants && item.variants.length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">
                  Select Size <span className="required-badge">Required</span>
                </h3>
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

            {/* Customizations */}
            {item.customizations && item.customizations.length > 0 && (
              <div className="menu-item-details-customizations-list">
                {item.customizations.map((customization) => (
                  <div key={customization._id} className="menu-item-details-section">
                    <h3 className="menu-item-details-section-title">
                      {customization.name}
                      {customization.isRequired && <span className="required-badge">Required</span>}
                    </h3>
                    <div className="menu-item-details-customization-options">
                      {customization.options.map((option) => (
                        <label key={option} className="menu-item-details-customization-option">
                          <input
                            type="radio"
                            name={customization.name}
                            value={option}
                            checked={selectedCustomizations[customization.name] === option}
                            onChange={() => handleCustomizationChange(customization.name, option)}
                          />
                          <span className="custom-radio"></span>
                          <span className="option-name">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Addons */}
            {item.addons && item.addons.length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">Add-ons</h3>
                <div className="menu-item-details-addons-list">
                  {item.addons.map((addon) => (
                    <label key={addon._id} className="menu-item-details-addon-item">
                      <div className="addon-info">
                        <input
                          type="checkbox"
                          checked={!!selectedAddons.find((a) => a._id === addon._id)}
                          onChange={() => handleAddonToggle(addon)}
                        />
                        <span className="custom-checkbox"></span>
                        <span className="addon-name">{addon.name}</span>
                      </div>
                      <span className="addon-price">+{formatPrice(addon.price, currency)}</span>
                    </label>
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
            disabled={isAddDisabled}
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
