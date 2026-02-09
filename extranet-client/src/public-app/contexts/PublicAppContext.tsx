import React, { createContext, useContext } from 'react';
import { MenuResponse } from '../types/menu.types';

interface PublicAppContextType {
  menuData: MenuResponse;
  restaurantSlug: string;
  branchCode: string;
  qrCode?: string;
}

const PublicAppContext = createContext<PublicAppContextType | null>(null);

export const PublicAppProvider: React.FC<{
  children: React.ReactNode;
  value: PublicAppContextType;
}> = ({ children, value }) => {
  return (
    <PublicAppContext.Provider value={value}>
      {children}
    </PublicAppContext.Provider>
  );
};

export const usePublicApp = () => {
  const context = useContext(PublicAppContext);
  if (!context) {
    throw new Error('usePublicApp must be used within PublicAppProvider');
  }
  return context;
};