import { useState, useEffect } from 'react';
import { PublicInitData } from '@/public-app/types/menu.types';
import { menuApi } from '../api/menuApi';

export const usePublicInit = (restaurantSlug: string, qrCode?: string) => {
  const [data, setData] = useState<PublicInitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadInit = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await menuApi.getInit(restaurantSlug, qrCode);
        if (response.success) {
          setData(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInit();
  }, [restaurantSlug, qrCode]);

  return { data, loading, error };
};
