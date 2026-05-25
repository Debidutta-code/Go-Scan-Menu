import React from 'react';
import { motion } from 'framer-motion';
import { Category, MenuItem } from '@/public-app/types/menu.types';
import { MenuItemCard } from '../MenuItemCard/MenuItemCard';
import './CategorySection.css';

interface CategorySectionProps {
  category: Category;
  currency: string;
  onItemClick: (item: MenuItem) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = React.memo(({
  category,
  currency,
  onItemClick,
}) => {
  return (
    <motion.section
      id={`category-${category._id}`}
      className="category-section-container"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="category-section-header">
        <div className="category-section-title-wrapper">
          <h2 className="category-section-title">{category.name}</h2>
          <div className="category-section-accent" />
        </div>
        {category.description && (
          <p className="category-section-description">{category.description}</p>
        )}
      </div>

      <div className="category-section-items-list">
        {category.items?.map((item, index) => (
          <MenuItemCard
            key={item._id}
            item={item}
            currency={currency}
            onItemClick={onItemClick}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  );
});
