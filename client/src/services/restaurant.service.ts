import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

class RestaurantService {
  async getRestaurants() {
    return await apiService.get(API_ENDPOINTS.RESTAURANTS);
  }

  async getRestaurantById(id: string) {
    return await apiService.get(`${API_ENDPOINTS.RESTAURANTS}/${id}`);
  }

  async createRestaurant(data: any) {
    return await apiService.post(API_ENDPOINTS.RESTAURANTS, data);
  }

  async updateRestaurant(id: string, data: any) {
    return await apiService.put(`${API_ENDPOINTS.RESTAURANTS}/${id}`, data);
  }

  async deleteRestaurant(id: string) {
    return await apiService.delete(`${API_ENDPOINTS.RESTAURANTS}/${id}`);
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;
