import React, { createContext, useContext } from 'react';
import { Restaurant } from '@/public-app/types/menu.types';

interface PublicAppContextType {
  restaurant: Restaurant;       // basic restaurant info from the categories call
  restaurantSlug: string;
}

const PublicAppContext = createContext<PublicAppContextType | null>(null);

export const PublicAppProvider: React.FC<{
  children: React.ReactNode;
  value: PublicAppContextType;
}> = ({ children, value }) => (
  <PublicAppContext.Provider value={value}>{children}</PublicAppContext.Provider>
);

export const usePublicApp = () => {
  const context = useContext(PublicAppContext);
  if (!context) throw new Error('usePublicApp must be used within PublicAppProvider');
  return context;
};
