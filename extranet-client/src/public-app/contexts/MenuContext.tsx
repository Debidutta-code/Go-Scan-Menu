import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { ALL_CATEGORIES_ID } from '@/public-app/utils/constants';

interface MenuContextType {
  menu: Category[];
  loading: boolean;
  error: string;
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{
  children: ReactNode;
  value: {
    menu: Category[];
    loading: boolean;
    error: string;
  }
}> = ({ children, value }) => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES_ID);

  return (
    <MenuContext.Provider value={{ ...value, activeCategory, setActiveCategory }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};
