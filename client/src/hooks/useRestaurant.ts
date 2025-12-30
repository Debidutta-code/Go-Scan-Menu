import { useState, useEffect } from 'react';
import { restaurantService } from '@/services/restaurant.service';
import { branchService } from '@/services/branch.service';

export const useRestaurant = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response: any = await restaurantService.getRestaurants();
      setRestaurants(response.data || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantById = async (id: string) => {
    try {
      setLoading(true);
      const response: any = await restaurantService.getRestaurantById(id);
      setCurrentRestaurant(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch restaurant');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async (restaurantId: string) => {
    try {
      setLoading(true);
      const response: any = await branchService.getBranches(restaurantId);
      setBranches(response.data || []);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch branches');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    restaurants,
    currentRestaurant,
    branches,
    loading,
    error,
    fetchRestaurants,
    fetchRestaurantById,
    fetchBranches,
  };
};
