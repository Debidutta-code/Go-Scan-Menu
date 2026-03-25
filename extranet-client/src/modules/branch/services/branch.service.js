// src/services/branch.service.ts
import axiosInstance from '@/shared/services/axios.service';
export class BranchService {
    static getHeaders(token) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }
    static async getBranches(token, restaurantId, page = 1, limit = 100) {
        try {
            const rId = typeof restaurantId === 'object' ? restaurantId._id : restaurantId;
            const response = await axiosInstance.get(`/restaurants/${rId}/branches?page=${page}&limit=${limit}`, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch branches';
            throw new Error(message);
        }
    }
    static async getBranch(token, restaurantId, branchId) {
        try {
            const rId = typeof restaurantId === 'object' ? restaurantId._id : restaurantId;
            const response = await axiosInstance.get(`/restaurants/${rId}/branches/${branchId}`, { headers: this.getHeaders(token) });
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to fetch branch';
            throw new Error(message);
        }
    }
}
