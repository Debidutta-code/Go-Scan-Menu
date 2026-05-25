import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { SkeletonMenuItemList } from '@/public-app/components/common/Skeleton/SkeletonMenuItemList';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useMenu } from '@/public-app/contexts/MenuContext';
import { useScrollSpy } from '@/public-app/hooks/useScrollSpy';
import { MenuItem } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID, SCROLL_OFFSET } from '@/public-app/utils/constants';
import { Error } from '@/public-app/components/common/Error/Error';
import './MenuListPage.css';

export const MenuListPage: React.FC = () => {
  const { restaurant } = usePublicApp();
  const { menu, loading, error, setActiveCategory } = useMenu();
  const [searchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const isFirstLoad = useRef(true);

  // Initial scroll to category if provided in URL
  useEffect(() => {
    if (!loading && menu.length > 0 && isFirstLoad.current) {
      const categoryId = searchParams.get('category');
      if (categoryId && categoryId !== ALL_CATEGORIES_ID) {
        isFirstLoad.current = false;
        setTimeout(() => {
          const element = document.getElementById(`category-${categoryId}`);
          const scrollContainer = document.querySelector('.public-main');
          if (element && scrollContainer) {
            const top = element.offsetTop - SCROLL_OFFSET;
            scrollContainer.scrollTo({ top, behavior: 'auto' });
            setActiveCategory(categoryId);
          }
        }, 100);
      } else {
        isFirstLoad.current = false;
      }
    }
  }, [loading, menu, searchParams, setActiveCategory]);

  const categoryIds = useMemo(() => menu.map((cat) => `category-${cat._id}`), [menu]);
  const scrolledCategoryId = useScrollSpy(categoryIds, SCROLL_OFFSET + 10);

  useEffect(() => {
    if (scrolledCategoryId) {
      const id = scrolledCategoryId.replace('category-', '');
      setActiveCategory(id);
    }
  }, [scrolledCategoryId, setActiveCategory]);

  if (error) {
    return <Error message={error} />;
  }

  if (loading) {
    return <SkeletonMenuItemList />;
  }

  return (
    <div className="menu-page-content">
      {menu.map((category) => (
        <CategorySection
          key={category._id}
          category={category}
          currency={restaurant.settings?.currency || 'USD'}
          onItemClick={setSelectedItem}
        />
      ))}

      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          currency={restaurant.settings?.currency || 'USD'}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
