import React, { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { SkeletonCategoryFilter } from '@/public-app/components/common/Skeleton/SkeletonCategoryFilter';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useMenuItems } from '@/public-app/hooks/useMenuItems';
import { MenuProvider, useMenu } from '@/public-app/contexts/MenuContext';
import { ALL_CATEGORIES_ID, SCROLL_OFFSET } from '@/public-app/utils/constants';

const MenuWrapperContent: React.FC = () => {
  const { menu, loading, activeCategory, setActiveCategory } = useMenu();
  const { restaurantSlug, qrCode } = usePublicApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isItemsPage = location.pathname.endsWith('/items');

  // Sync activeCategory with URL
  useEffect(() => {
    if (isItemsPage) {
      const categoryId = searchParams.get('category') || ALL_CATEGORIES_ID;
      setActiveCategory(categoryId);
    } else {
      setActiveCategory(ALL_CATEGORIES_ID);
    }
  }, [isItemsPage, searchParams, setActiveCategory]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    const basePath = qrCode
      ? `/menu/${restaurantSlug}/${qrCode}`
      : `/menu/${restaurantSlug}`;

    if (categoryId === ALL_CATEGORIES_ID) {
      navigate(basePath);
    } else {
      if (isItemsPage) {
        // Just scroll if already on items page
        setActiveCategory(categoryId);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          const scrollContainer = document.querySelector('.public-main');
          if (scrollContainer) {
            const top = element.offsetTop - SCROLL_OFFSET;
            scrollContainer.scrollTo({ top, behavior: 'smooth' });
          }
        }
        // Also update URL without full navigation if possible, or just navigate
        navigate(`${basePath}/items?category=${categoryId}`, { replace: true });
      } else {
        navigate(`${basePath}/items?category=${categoryId}`);
      }
    }
  }, [navigate, restaurantSlug, qrCode, isItemsPage, setActiveCategory]);

  return (
    <div className="wrapper-menu-page">
      {loading ? (
        <SkeletonCategoryFilter />
      ) : (
        <CategoryFilter
          categories={menu}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
      <Outlet />
    </div>
  );
};

export const MenuWrapper: React.FC = () => {
  const { restaurantSlug } = usePublicApp();
  const menuData = useMenuItems(restaurantSlug);

  return (
    <MenuProvider value={menuData}>
      <MenuWrapperContent />
    </MenuProvider>
  );
};
