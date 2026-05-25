import { useState, useEffect } from 'react';
import { MenuData } from '@/public-app/types/menu.types';
import { menuApi } from '../api/menuApi';

export const useMenu = (restaurantSlug: string, enabled: boolean = true) => {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (enabled) {
      load();
    }
  }, [restaurantSlug, enabled]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await menuApi.getMenu(restaurantSlug);
      if (response.success && response.data) {
        setMenuData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  return { menuData, loading, error, refetch: load };
};
