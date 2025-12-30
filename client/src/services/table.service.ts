import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

class TableService {
  async getTables(restaurantId: string, branchId?: string) {
    const params = branchId ? { branchId } : {};
    return await apiService.get(API_ENDPOINTS.TABLES(restaurantId), params);
  }

  async getTableById(restaurantId: string, tableId: string) {
    return await apiService.get(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`);
  }

  async createTable(restaurantId: string, data: any) {
    return await apiService.post(API_ENDPOINTS.TABLES(restaurantId), data);
  }

  async updateTable(restaurantId: string, tableId: string, data: any) {
    return await apiService.put(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`, data);
  }

  async deleteTable(restaurantId: string, tableId: string) {
    return await apiService.delete(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}`);
  }

  async updateTableStatus(restaurantId: string, tableId: string, status: string) {
    return await apiService.patch(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}/status`, {
      status,
    });
  }

  async generateQR(restaurantId: string, tableId: string) {
    return await apiService.post(`${API_ENDPOINTS.TABLES(restaurantId)}/${tableId}/qr-code`);
  }
}

export const tableService = new TableService();
export default tableService;
