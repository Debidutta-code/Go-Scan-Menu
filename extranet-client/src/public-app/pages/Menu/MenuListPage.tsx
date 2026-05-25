import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { SkeletonCategoryFilter } from '@/public-app/components/common/Skeleton/SkeletonCategoryFilter';
import { SkeletonMenuItemList } from '@/public-app/components/common/Skeleton/SkeletonMenuItemList';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useMenuItems } from '@/public-app/hooks/useMenuItems';
import { MenuItem } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID, SCROLL_OFFSET } from '@/public-app/utils/constants';
import { Error } from '@/public-app/components/common/Error/Error';
import './MenuListPage.css';

export const MenuListPage: React.FC = () => {
  const { restaurantSlug, restaurant, qrCode } = usePublicApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategoryId = searchParams.get('category') || ALL_CATEGORIES_ID;

  const { menu, loading, error } = useMenuItems(restaurantSlug);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategoryId);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const isFirstLoad = useRef(true);

  // Initial scroll to category if provided in URL
  useEffect(() => {
    if (!loading && menu.length > 0 && isFirstLoad.current) {
      const categoryId = searchParams.get('category');
      const scrollContainer = document.querySelector('.public-main');

      if (categoryId && categoryId !== ALL_CATEGORIES_ID && scrollContainer) {
        isFirstLoad.current = false;
        setTimeout(() => {
          const element = document.getElementById(`category-${categoryId}`);
          if (element) {
            const top = element.offsetTop - SCROLL_OFFSET;
            scrollContainer.scrollTo({ top, behavior: 'auto' });
            setActiveCategory(categoryId);
          }
        }, 100);
      } else {
        isFirstLoad.current = false;
      }
    }
  }, [loading, menu, searchParams]);

  // Scroll spy
  useEffect(() => {
    if (loading) return;

    const scrollContainer = document.querySelector('.public-main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollY = (scrollContainer as HTMLElement).scrollTop + SCROLL_OFFSET + 50;

      for (let i = menu.length - 1; i >= 0; i--) {
        const cat = menu[i];
        const el = document.getElementById(`category-${cat._id}`);
        if (el && el.offsetTop <= scrollY) {
          setActiveCategory(cat._id);
          return;
        }
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loading, menu]);

  const handleFilterCategoryChange = useCallback((categoryId: string) => {
    const scrollContainer = document.querySelector('.public-main');
    if (!scrollContainer) return;

    if (categoryId === ALL_CATEGORIES_ID) {
      const basePath = qrCode
        ? `/menu/${restaurantSlug}/${qrCode}`
        : `/menu/${restaurantSlug}`;
      navigate(basePath);
    } else {
      setActiveCategory(categoryId);
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const top = element.offsetTop - SCROLL_OFFSET;
        scrollContainer.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, []);

  if (error) {
    return <Error message={error} />;
  }

  return (
    <div className="wrapper-menu-page">
      {loading ? (
        <>
          <SkeletonCategoryFilter />
          <SkeletonMenuItemList />
        </>
      ) : (
        <>
          <CategoryFilter
            categories={menu}
            activeCategory={activeCategory}
            onCategoryChange={handleFilterCategoryChange}
          />

          <div className="menu-page-content">
            {menu.map((category) => (
              <CategorySection
                key={category._id}
                category={category}
                currency={restaurant.settings?.currency || 'USD'}
                onItemClick={setSelectedItem}
              />
            ))}
          </div>
        </>
      )}

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
