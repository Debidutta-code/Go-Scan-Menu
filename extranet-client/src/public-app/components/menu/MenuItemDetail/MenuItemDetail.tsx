import React, { useState, useEffect } from 'react';
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ModifierOption[]>>({});
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when item changes
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      const defaultVariant = item.variants?.find(v => v.isDefault)?._id || item.variants?.[0]?._id || '';
      setSelectedVariant(defaultVariant);
      setSelectedAddons([]);
      setSelectedCustomizations({});
      setCurrentImageIndex(0);
    }
  }, [item._id, isOpen]);

  const images =
    item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];

  const handleOptionToggle = (group: ModifierGroup, option: ModifierOption) => {
    setSelectedOptions((prev) => {
      const currentGroupOptions = prev[group._id] || [];
      const isSelected = currentGroupOptions.find((o) => o._id === option._id);

      let newGroupOptions: ModifierOption[];

      if (group.isMultiSelect) {
        if (isSelected) {
          newGroupOptions = currentGroupOptions.filter((o) => o._id !== option._id);
        } else {
          if (currentGroupOptions.length < group.maxSelections) {
            newGroupOptions = [...currentGroupOptions, option];
          } else {
            // If at max, we could either do nothing or replace one.
            // Let's do nothing for strict enforcement.
            return prev;
          }
        }
      } else {
        // Single select (radio behavior)
        newGroupOptions = [option];
      }

      return {
        ...prev,
        [group._id]: newGroupOptions,
      };
    });
  };



  const getCurrentPrice = () => {
    let price = item.discountPrice || item.price;

    // Add variant price (if exists, usually base price is variant 0, but let's check)
    // If variants exist, base price might be overridden by variant price
    if (item.variants && item.variants.length > 0) {
        const variant = item.variants.find(v => v._id === selectedVariant);
        if (variant) price = variant.price;
    }

    // Add modifier prices
    Object.values(selectedOptions).forEach((options) => {
      options.forEach((opt) => {
        price += opt.price;
      });
    });

    // Add addon prices
    selectedAddons.forEach(addonId => {
        const addon = item.addons?.find(a => a._id === addonId);
        if (addon) price += addon.price;
    });

    return price;
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

            {/* Render Variants */}
            {(item.variants || []).length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">
                  Select Variant
                  <span className="required-badge">Required</span>
                </h3>
                <div className="modifier-options-list">
                  {item.variants?.map((variant) => (
                    <label key={variant._id} className="menu-item-details-addon-item">
                      <div className="addon-info">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariant === variant._id}
                          onChange={() => setSelectedVariant(variant._id)}
                        />
                        <span className="custom-radio"></span>
                        <span className="addon-name">{variant.name}</span>
                      </div>
                      <span className="addon-price">{formatPrice(variant.price, currency)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Render Modifier Groups */}
            {(item.modifierGroups || []).map((group) => (
              <div key={group._id} className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">
                  {group.name}
                  {group.isRequired && <span className="required-badge">Required</span>}
                </h3>
                {group.description && <p className="field-help-text">{group.description}</p>}

                <div className="modifier-options-list">
                  {group.options.map((option) => {
                    const isSelected = !!(selectedOptions[group._id] || []).find((o) => o._id === option._id);
                    return (
                      <label key={option._id} className={`menu-item-details-addon-item ${!option.isAvailable ? 'disabled' : ''}`}>
                        <div className="addon-info">
                          <input
                            type={group.isMultiSelect ? "checkbox" : "radio"}
                            name={group._id}
                            checked={isSelected}
                            disabled={!option.isAvailable}
                            onChange={() => handleOptionToggle(group, option)}
                          />
                          <span className={group.isMultiSelect ? "custom-checkbox" : "custom-radio"}></span>
                          <span className="addon-name">{option.name}</span>
                        </div>
                        <span className="addon-price">
                          {option.price > 0 ? `+${formatPrice(option.price, currency)}` : 'Free'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Render Addons */}
            {(item.addons || []).length > 0 && (
              <div className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">Add-ons</h3>
                <div className="modifier-options-list">
                  {item.addons?.map((addon) => (
                    <label key={addon._id} className="menu-item-details-addon-item">
                      <div className="addon-info">
                        <input
                          type="checkbox"
                          checked={selectedAddons.includes(addon._id)}
                          onChange={() => {
                            setSelectedAddons(prev =>
                              prev.includes(addon._id)
                                ? prev.filter(id => id !== addon._id)
                                : [...prev, addon._id]
                            );
                          }}
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

            {/* Render Customizations */}
            {(item.customizations || []).map((cust) => (
              <div key={cust._id} className="menu-item-details-section">
                <h3 className="menu-item-details-section-title">
                  {cust.name}
                  {cust.isRequired && <span className="required-badge">Required</span>}
                </h3>
                <div className="modifier-options-list">
                  {cust.options.map((option) => (
                    <label key={option} className="menu-item-details-addon-item">
                      <div className="addon-info">
                        <input
                          type="radio"
                          name={cust._id}
                          checked={selectedCustomizations[cust._id] === option}
                          onChange={() => setSelectedCustomizations(prev => ({ ...prev, [cust._id]: option }))}
                        />
                        <span className="custom-radio"></span>
                        <span className="addon-name">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="menu-item-details-footer">
          <div className="menu-item-details-price-display">
            {item.isAvailable ? (
              <span className="current-price">Price: {formatPrice(getCurrentPrice(), currency)}</span>
            ) : (
              <span className="not-available">Not Available</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
