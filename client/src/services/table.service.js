import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';
class TableService {
    async getTables(restaurantId, branchId) {
        const params = branchId ? { branchId } : {};
        return await apiService.get(API_ENDPOINTS.TABLES(restaurantId), params);
    }
    async getTableById(restaurantId, tableId) {
        return await apiService.get(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`);
    }
    async createTable(restaurantId, data) {
        return await apiService.post(API_ENDPOINTS.TABLES(restaurantId), data);
    }
    async updateTable(restaurantId, tableId, data) {
        return await apiService.put(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`, data);
    }
    async deleteTable(restaurantId, tableId) {
        return await apiService.delete(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`);
    }
    async updateTableStatus(restaurantId, tableId, status) {
        return await apiService.patch(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}/status`, {
            status,
        });
    }
    async generateQR(restaurantId, tableId) {
        return await apiService.post(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}/qr-code`);
    }
}
export const tableService = new TableService();
export default tableService;
