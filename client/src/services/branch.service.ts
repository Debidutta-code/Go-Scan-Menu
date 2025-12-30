import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

class BranchService {
  async getBranches(restaurantId: string) {
    return await apiService.get(API_ENDPOINTS.BRANCHES(restaurantId));
  }

  async getBranchById(restaurantId: string, branchId: string) {
    return await apiService.get(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`);
  }

  async createBranch(restaurantId: string, data: any) {
    return await apiService.post(API_ENDPOINTS.BRANCHES(restaurantId), data);
  }

  async updateBranch(restaurantId: string, branchId: string, data: any) {
    return await apiService.put(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`, data);
  }

  async deleteBranch(restaurantId: string, branchId: string) {
    return await apiService.delete(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`);
  }
}

export const branchService = new BranchService();
export default branchService;
