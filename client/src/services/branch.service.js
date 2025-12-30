import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';
class BranchService {
    async getBranches(restaurantId) {
        return await apiService.get(API_ENDPOINTS.BRANCHES(restaurantId));
    }
    async getBranchById(restaurantId, branchId) {
        return await apiService.get(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`);
    }
    async createBranch(restaurantId, data) {
        return await apiService.post(API_ENDPOINTS.BRANCHES(restaurantId), data);
    }
    async updateBranch(restaurantId, branchId, data) {
        return await apiService.put(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`, data);
    }
    async deleteBranch(restaurantId, branchId) {
        return await apiService.delete(`${API_ENDPOINTS.BRANCHES(restaurantId)}/${branchId}`);
    }
}
export const branchService = new BranchService();
export default branchService;
