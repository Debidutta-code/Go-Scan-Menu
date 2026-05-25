import { useState, useEffect } from 'react';
import { Category } from '@/public-app/types/menu.types';
import { menuApi } from '../api/menuApi';

export const useCategories = (restaurantSlug: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await menuApi.getCategories(restaurantSlug);
        if (response.success) {
          setCategories(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [restaurantSlug]);

  return { categories, loading, error };
};
