import { useState, useEffect } from 'react';
import { SCROLL_OFFSET } from '../utils/constants';

export const useScrollSpy = (categoryIds: string[]) => {
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + SCROLL_OFFSET + 50;

      for (let i = categoryIds.length - 1; i >= 0; i--) {
        const element = document.getElementById(categoryIds[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveCategory(categoryIds[i]);
          return;
        }
      }

      // If scrolled to top, clear active category
      if (window.scrollY < 200) {
        setActiveCategory('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [categoryIds]);

  return activeCategory;
};
