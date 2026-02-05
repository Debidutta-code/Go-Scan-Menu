import { useState, useEffect } from 'react';
import { MenuData } from '../types/menu.types';
import { menuApi } from '../api/menuApi';

export const useMenu = (restaurantSlug: string, branchCode: string, qrCode?: string) => {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMenu();
  }, [restaurantSlug, branchCode, qrCode]);

  const loadMenu = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await menuApi.getMenu(restaurantSlug, branchCode, qrCode);

      if (response.success && response.data) {
        setMenuData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  return { menuData, loading, error, refetch: loadMenu };
};
