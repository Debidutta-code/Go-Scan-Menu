import { useState, useEffect } from 'react';
import { menuService } from '@/services/menu.service';

export const useMenu = (restaurantSlug?: string, branchCode?: string) => {
  const [menu, setMenu] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicMenu = async (slug: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await menuService.getPublicMenu(slug, code);
      setMenu(response.data);
      setCategories(response.data.categories || []);
      setMenuItems(response.data.menuItems || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch menu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (restaurantId: string) => {
    try {
      setLoading(true);
      const response: any = await menuService.getCategories(restaurantId);
      setCategories(response.data || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async (restaurantId: string, params?: any) => {
    try {
      setLoading(true);
      const response: any = await menuService.getMenuItems(restaurantId, params);
      setMenuItems(response.data || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch menu items');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantSlug && branchCode) {
      fetchPublicMenu(restaurantSlug, branchCode);
    }
  }, [restaurantSlug, branchCode]);

  return {
    menu,
    categories,
    menuItems,
    loading,
    error,
    fetchPublicMenu,
    fetchCategories,
    fetchMenuItems,
  };
};
