import React, { useState, useEffect, useRef } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '400px', // Start rendering before it enters the viewport
        threshold: 0.01,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id={`category-${category._id}`}
      className="category-section-container"
    >
      <div className="category-section-header">
        <h2 className="category-section-title">{category.name}</h2>
        {category.description && (
          <p className="category-section-description">{category.description}</p>
        )}
      </div>

      <div className="category-section-items-list">
        {isVisible ? (
          category.items.map((item) => (
            <MenuItemCard
              key={item._id}
              item={item}
              currency={currency}
              onItemClick={onItemClick}
            />
          ))
        ) : (
          /* Placeholder to maintain height while loading */
          <div style={{ height: category.items.length * 124 }} />
        )}
      </div>
    </section>
  );
});
