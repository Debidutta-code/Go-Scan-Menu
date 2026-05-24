import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useScrollSpy } from '@/public-app/hooks/useScrollSpy';
import { MenuItem } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID, SCROLL_OFFSET } from '@/public-app/utils/constants';
import './MenuPage.css';

export const MenuPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_ID);

  const spyIds = useMemo(
    () => [ALL_CATEGORIES_ID, ...menuData.menu.map((cat) => `category-${cat._id}`)],
    [menuData.menu]
  );

  const scrollSpyCategory = useScrollSpy(spyIds, SCROLL_OFFSET);

  useEffect(() => {
    if (scrollSpyCategory) {
      const categoryId = scrollSpyCategory === ALL_CATEGORIES_ID
        ? ALL_CATEGORIES_ID
        : scrollSpyCategory.replace('category-', '');
      setActiveCategory(categoryId);
    }
  }, [scrollSpyCategory]);

  const handleItemClick = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);

    const scroller = document.querySelector('.public-main');
    if (!scroller) return;

    if (categoryId === ALL_CATEGORIES_ID) {
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const scrollerRect = scroller.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - scrollerRect.top;
        const scrollTarget = scroller.scrollTop + relativeTop - SCROLL_OFFSET;

        scroller.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  return (
    <div className="wrapper-menu-page">
      <CategoryFilter
        categories={menuData.menu}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="menu-page-content">
        {/* Always render everything to avoid re-mounting flickers */}
        <div id={ALL_CATEGORIES_ID}>
          <CategoryGrid
            categories={menuData.menu}
            onCategoryClick={handleCategoryChange}
          />
        </div>

        {menuData.menu.map((category) => (
          <CategorySection
            key={category._id}
            category={category}
            currency={menuData.restaurant.settings?.currency || 'USD'}
            onItemClick={handleItemClick}
          />
        ))}
      </div>

      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          currency={menuData.restaurant.settings?.currency || 'USD'}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
