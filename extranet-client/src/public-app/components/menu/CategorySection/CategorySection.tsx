import React from 'react';
import { Category, MenuItem } from '@/public-app/types/menu.types';
import { MenuItemCard } from '../MenuItemCard/MenuItemCard';
import './CategorySection.css';

interface CategorySectionProps {
  category: Category;
  currency: string;
  onItemClick: (item: MenuItem) => void;
  onAddClick: (item: MenuItem) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  currency,
  onItemClick,
  onAddClick,
}) => {
  return (
    <section id={`category-${category._id}`} className="category-section-container">
      <div className="category-section-header">
        <h2 className="category-section-title">{category.name}</h2>
        {category.description && (
          <p className="category-section-description">{category.description}</p>
        )}
      </div>

      <div className="category-section-items-list">
        {category.items.map((item) => (
          <MenuItemCard
            key={item._id}
            item={item}
            currency={currency}
            onItemClick={onItemClick}
            onAddClick={onAddClick}
          />
        ))}
      </div>
    </section>
  );
};
