import React, { useState, useMemo } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useScrollSpy } from '@/public-app/hooks/useScrollSpy';
import { MenuItem } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID } from '@/public-app/utils/constants';
import './MenuPage.css';

export const MenuPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view'>('view');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_ID);

  const categoryIds = useMemo(
    () => menuData.menu.map((cat) => cat._id),
    [menuData.menu]
  );

  const scrollSpyCategory = useScrollSpy(categoryIds.map((id) => `category-${id}`));

  React.useEffect(() => {
    if (scrollSpyCategory) {
      const categoryId = scrollSpyCategory.replace('category-', '');
      setActiveCategory(categoryId);
    } else if (window.scrollY < 300) {
      setActiveCategory(ALL_CATEGORIES_ID);
    }
  }, [scrollSpyCategory]);

  const handleItemClick = (item: MenuItem) => {
    setDrawerMode('view');
    setSelectedItem(item);
  };

  return (
    <div className="wrapper-menu-page">
      <CategoryFilter
        categories={menuData.menu}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="menu-page-content">
        {activeCategory === ALL_CATEGORIES_ID ? (
          <CategoryGrid categories={menuData.menu} onCategoryClick={setActiveCategory} />
        ) : (
          menuData.menu.map((category) => (
            <CategorySection
              key={category._id}
              category={category}
              currency={menuData.restaurant.settings?.currency || 'USD'}
              onItemClick={handleItemClick}
            />
          ))
        )}
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
