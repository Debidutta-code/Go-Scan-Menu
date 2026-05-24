import React, { useMemo } from 'react';
import { MenuItem } from '@/public-app/types/menu.types';
import { formatPrice, getSpiceLevelEmoji, getDietaryIcon } from '@/public-app/utils/formatters';
import { isImageCached, markImageAsCached } from '@/public-app/utils/image-cache';
import './MenuItemCard.css';

interface MenuItemCardProps {
  item: MenuItem;
  currency: string;
  onItemClick: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({
  item,
  currency,
  onItemClick,
}) => {
  const [imageLoaded, setImageLoaded] = React.useState(item.image ? isImageCached(item.image) : false);
  const minPrice = useMemo(() => {
    let price = item.discountPrice || item.price;

    if (item.modifierGroups && item.modifierGroups.length > 0) {
      item.modifierGroups.forEach((mg: any) => {
        const options = mg.options || [];
        options.forEach((opt: any) => {
          if (opt.price !== undefined && opt.price < price && opt.price > 0) {
            price = opt.price;
          }
        });
      });
    }

    return price;
  }, [item.discountPrice, item.price, item.modifierGroups]);

  const hasMultiplePrices = useMemo(() =>
    minPrice !== (item.discountPrice || item.price),
    [minPrice, item.discountPrice, item.price]
  );

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
            className={`menu-item-card-image-horizontal ${!imageLoaded ? 'loading' : ''}`}
            loading="lazy"
            decoding="async"
            width="100"
            height="100"
            onLoad={() => {
              if (item.image) markImageAsCached(item.image);
              setImageLoaded(true);
            }}
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
            <span className="menu-item-card-current-price-horizontal">
              {hasMultiplePrices && <span className="price-from" style={{ fontSize: '0.8em', opacity: 0.8 }}>from </span>}
              {formatPrice(minPrice, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
