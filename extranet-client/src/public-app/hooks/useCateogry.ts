import { useState, useEffect } from 'react';
import { CategoryListData } from '@/public-app/types/menu.types';
import { categoryApi } from '../api/categoryApi';

export const useCategories = (restaurantSlug: string) => {
  const [data, setData] = useState<CategoryListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [restaurantSlug]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoryApi.getCategories(restaurantSlug);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: load };
};