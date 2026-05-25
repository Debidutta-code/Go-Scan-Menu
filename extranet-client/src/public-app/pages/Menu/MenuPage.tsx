import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { Loading } from '@/public-app/components/common/Loading/Loading';
import { Error } from '@/public-app/components/common/Error/Error';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { useMenu } from '@/public-app/hooks/useMenu';
import { MenuItem } from '@/public-app/types/menu.types';
import { SCROLL_OFFSET } from '@/public-app/utils/constants';
import './MenuPage.css';
import { useCategories } from '@/public-app/hooks/useCateogry';

type View = 'grid' | 'list';

export const MenuPage: React.FC = () => {
  const { restaurantSlug } = usePublicApp();

  // ── View state ────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Category to scroll-to after the list mounts
  const pendingScrollRef = useRef<string | null>(null);

  // ── Page 1: category grid ─────────────────────────────────────────────────
  const {
    data: categoryData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(restaurantSlug);

  // ── Page 2: full menu with items — only fetched when list view is first opened
  const [menuFetched, setMenuFetched] = useState(false);
  const {
    menuData,
    loading: menuLoading,
    error: menuError,
  } = useMenu(restaurantSlug, menuFetched);

  // ── Scroll to category once list view mounts and menu data is ready ───────
  useEffect(() => {
    if (view === 'list' && menuData && pendingScrollRef.current) {
      const targetId = pendingScrollRef.current;
      pendingScrollRef.current = null;

      // Let the DOM paint before measuring offsetTop
      const timer = setTimeout(() => {
        const el = document.getElementById(`category-${targetId}`);
        if (el) {
          window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
        }
      }, 60);

      return () => clearTimeout(timer);
    }
  }, [view, menuData]);

  // ── Scroll spy — highlight the correct filter tab while scrolling ─────────
  useEffect(() => {
    if (view !== 'list' || !menuData) return;

    const handleScroll = () => {
      const scrollY = window.scrollY + SCROLL_OFFSET + 50;
      for (let i = menuData.menu.length - 1; i >= 0; i--) {
        const cat = menuData.menu[i];
        const el = document.getElementById(`category-${cat._id}`);
        if (el && el.offsetTop <= scrollY) {
          setActiveCategory(cat._id);
          return;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view, menuData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Grid card clicked → go to list page, scroll to that category
  const handleGridCategoryClick = useCallback((categoryId: string) => {
    pendingScrollRef.current = categoryId;
    setActiveCategory(categoryId);
    setMenuFetched(true);   // triggers the menu API call (only on first click)
    setView('list');
    window.scrollTo({ top: 0, behavior: 'instant' }); // reset scroll position
  }, []);

  // Filter tab clicked while in list view → scroll to section
  const handleFilterCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
    }
  }, []);

  // "All" button in the filter bar → back to grid
  const handleBackToGrid = useCallback(() => {
    setView('grid');
    setActiveCategory('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  // Grid page
  if (view === 'grid') {
    if (categoriesLoading) return <Loading />;
    if (categoriesError) return <Error message={categoriesError} />;
    if (!categoryData) return <Error message="No categories found" />;

    return (
      <div className="wrapper-menu-page">
        <div className="menu-page-content menu-page-content--no-filter">
          <CategoryGrid
            categories={categoryData.categories}
            onCategoryClick={handleGridCategoryClick}
          />
        </div>
      </div>
    );
  }

  // List page
  if (menuLoading || !menuData) {
    return <Loading />;
  }

  if (menuError) {
    return <Error message={menuError} />;
  }

  return (
    <div className="wrapper-menu-page">
      <CategoryFilter
        categories={menuData.menu}
        activeCategory={activeCategory}
        onCategoryChange={handleFilterCategoryChange}
        onBackToGrid={handleBackToGrid}
      />

      <div className="menu-page-content">
        {menuData.menu.map((category) => (
          <CategorySection
            key={category._id}
            category={category}
            currency={menuData.restaurant.currency || 'USD'}
            onItemClick={setSelectedItem}
          />
        ))}
      </div>

      {selectedItem && (
        <MenuItemDetail
          item={selectedItem}
          currency={menuData.restaurant.currency || 'USD'}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};