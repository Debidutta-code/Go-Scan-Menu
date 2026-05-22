import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, ModifierGroup, ModifierOption } from '@/public-app/types/menu.types';
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
    quantity: number,
    selectedModifiers: Array<{
      groupId: string;
      groupName: string;
      options: Array<{
        optionId: string;
        name: string;
        price: number;
      }>;
    }>
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ModifierOption[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset state when item or mode changes
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [item._id, isOpen, mode]);

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

  const isAddDisabled = useMemo(() => {
    if (!item.isAvailable) return true;
    if (!item.modifierGroups) return false;

    return item.modifierGroups.some((group) => {
      const selections = selectedOptions[group._id] || [];
      return group.isRequired && selections.length < (group.minSelections || 1);
    });
  }, [item.isAvailable, item.modifierGroups, selectedOptions]);

  const handleAddToCart = () => {
    const selectedModifiers = (item.modifierGroups || []).map((group) => ({
      groupId: group._id,
      groupName: group.name,
      options: (selectedOptions[group._id] || []).map((opt) => ({
        optionId: opt._id,
        name: opt.name,
        price: opt.price,
      })),
    })).filter(g => g.options.length > 0);

    onAddToCart(item, quantity, selectedModifiers);
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const getCurrentPrice = () => {
    let price = item.discountPrice || item.price;
    Object.values(selectedOptions).forEach((options) => {
      options.forEach((opt) => {
        price += opt.price;
      });
    });
    return price;
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

            {!isCustomizeMode && item.description && <p className="menu-item-details-description">{item.description}</p>}

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
          </div>
        </div>

        <div className="menu-item-details-footer">
          <div className="menu-item-details-quantity-selector">
            <button className="menu-item-details-quantity-btn" onClick={decrementQuantity}>−</button>
            <span className="menu-item-details-quantity-value">{quantity}</span>
            <button className="menu-item-details-quantity-btn" onClick={incrementQuantity}>+</button>
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
