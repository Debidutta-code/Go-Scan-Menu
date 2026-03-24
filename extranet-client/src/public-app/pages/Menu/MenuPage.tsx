import React, { useState, useMemo } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useCart } from '@/public-app/contexts/CartContext';
import { useScrollSpy } from '@/public-app/hooks/useScrollSpy';
import { MenuItem, Variant, Addon } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID } from '@/public-app/utils/constants';
import './MenuPage.css';

export const MenuPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const { addItem } = useCart();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
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
    setSelectedItem(item);
  };

  const handleAddClick = (item: MenuItem) => {
    // If it has variants, we should open the detail view instead of adding directly
    if (item.variants && item.variants.length > 0) {
      setSelectedItem(item);
    } else {
      addItem(item);
    }
  };

  const handleAddToCart = (item: MenuItem, variant?: Variant, addons: Addon[] = [], quantity: number = 1) => {
    addItem(item, variant, addons, quantity);
    setSelectedItem(null);
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
              currency={menuData.branch.settings.currency}
              onItemClick={handleItemClick}
              onAddClick={handleAddClick}
            />
          ))
        )}
      </div>

      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          currency={menuData.branch.settings.currency}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};
