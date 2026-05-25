import { useState, useEffect } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { menuApi } from '../api/menuApi';

export const useMenuItems = (restaurantSlug: string) => {
  const [menu, setMenu] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await menuApi.getMenu(restaurantSlug);
        if (response.success) {
          setMenu(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [restaurantSlug]);

  return { menu, loading, error };
};
