import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CategoryFilter } from '@/public-app/components/menu/CategoryFilter/CategoryFilter';
import { CategoryGrid } from '@/public-app/components/menu/CategoryGrid/CategoryGrid';
import { CategorySection } from '@/public-app/components/menu/CategorySection/CategorySection';
import { MenuItemDetail } from '@/public-app/components/menu/MenuItemDetail/MenuItemDetail';
import { usePublicApp } from '@/public-app/contexts/PublicAppContext';
import { MenuItem } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID, SCROLL_OFFSET } from '@/public-app/utils/constants';
import './MenuPage.css';

type View = 'grid' | 'list';

export const MenuPage: React.FC = () => {
  const { menuData } = usePublicApp();
  const [view, setView] = useState<View>('grid');
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_ID);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Used to know which category to scroll to after the list view mounts
  const pendingScrollRef = useRef<string | null>(null);

  // After switching to list view, scroll to the target category
  useEffect(() => {
    if (view === 'list' && pendingScrollRef.current) {
      const targetId = pendingScrollRef.current;
      pendingScrollRef.current = null;

      // Small timeout lets the DOM paint before we measure offsetTop
      const timer = setTimeout(() => {
        const element = document.getElementById(`category-${targetId}`);
        if (element) {
          const top = element.offsetTop - SCROLL_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [view]);

  // Scroll spy — only active in list view
  useEffect(() => {
    if (view !== 'list') return;

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
  }, [view, menuData.menu]);

  // Called when a category card in the grid is clicked
  const handleGridCategoryClick = useCallback((categoryId: string) => {
    pendingScrollRef.current = categoryId;
    setActiveCategory(categoryId);
    setView('list');
  }, []);

  // Called when the category filter bar tab is clicked
  const handleFilterCategoryChange = useCallback((categoryId: string) => {
    if (categoryId === ALL_CATEGORIES_ID) {
      // Go back to the grid
      setView('grid');
      setActiveCategory(ALL_CATEGORIES_ID);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (view !== 'list') {
        // Coming from grid — switch to list first, then scroll
        pendingScrollRef.current = categoryId;
        setActiveCategory(categoryId);
        setView('list');
      } else {
        // Already in list — just scroll to the section
        setActiveCategory(categoryId);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
          const top = element.offsetTop - SCROLL_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }
  }, [view]);

  return (
    <div className="wrapper-menu-page">
      <CategoryFilter
        categories={menuData.menu}
        activeCategory={activeCategory}
        onCategoryChange={handleFilterCategoryChange}
      />

      <div className="menu-page-content">
        {view === 'grid' ? (
          <CategoryGrid
            categories={menuData.menu}
            onCategoryClick={handleGridCategoryClick}
          />
        ) : (
          menuData.menu.map((category) => (
            <CategorySection
              key={category._id}
              category={category}
              currency={menuData.restaurant.settings?.currency || 'USD'}
              onItemClick={setSelectedItem}
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
