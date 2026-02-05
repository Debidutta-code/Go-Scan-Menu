import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../../components/common/Navbar/Navbar';
import { Loading } from '../../components/common/Loading/Loading';
import { Error } from '../../components/common/Error/Error';
import { CategoryFilter } from '../../components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '../../components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '../../components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '../../components/menu/MenuItemDetail/MenuItemDetail';
import { useMenu } from '../../hooks/useMenu';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { MenuItem, Variant } from '../../types/menu.types';
import { ALL_CATEGORIES_ID } from '../../utils/constants';
import './MenuPage.css';

export const MenuPage: React.FC = () => {
  const { restaurantSlug, branchCode, qrCode } = useParams<{
    restaurantSlug: string;
    branchCode: string;
    qrCode?: string;
  }>();

  const { menuData, loading, error } = useMenu(restaurantSlug!, branchCode!, qrCode);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_ID);

  const categoryIds = useMemo(
    () => (menuData ? menuData.menu.map((cat) => cat.id) : []),
    [menuData]
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
    console.log('Add to cart:', item);
  };

  const handleAddToCart = (item: MenuItem, variant?: Variant, quantity?: number) => {
    console.log('Add to cart:', { item, variant, quantity });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!menuData) {
    return <Error message="Menu not available" />;
  }

  return (
    <div className="menu-page">
      <Navbar restaurant={menuData.restaurant} table={menuData.table} />

      <CategoryFilter
        categories={menuData.menu}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="menu-page-content">
        {activeCategory === ALL_CATEGORIES_ID ? (
          <CategoryGrid categories={menuData.menu} onCategoryClick={setActiveCategory} />
        ) : (
          menuData.menu.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              currency={menuData.branch.settings.currency}
              onItemClick={handleItemClick}
              onAddClick={handleAddClick}
            />
          ))
        )}
      </main>

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
