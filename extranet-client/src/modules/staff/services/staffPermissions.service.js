// extranet-client/src/modules/staff/services/staffPermissions.service.ts
import env from '@/shared/config/env';
export class StaffPermissionsService {
    static getHeaders(token) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    static async request(endpoint, options = {}, token) {
        try {
            const response = await fetch(`${env.API_BASE_URL}${endpoint}`, {
                ...options,
                headers: this.getHeaders(token),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            return data;
        }
        catch (error) {
            throw error instanceof Error ? error : new Error('Network error');
        }
    }
    // GET all roles for a restaurant
    static async getAllRoles(token, restaurantId) {
        return this.request(`/roles?restaurantId=${restaurantId}`, {}, token);
    }
    // GET role by ID
    static async getRole(token, roleId) {
        return this.request(`/roles/${roleId}`, {}, token);
    }
    // UPDATE permissions for a specific role
    static async updateRolePermissions(token, roleId, payload) {
        return this.request(`/roles/${roleId}/permissions`, {
            method: 'PUT',
            body: JSON.stringify(payload.permissions),
        }, token);
    }
}
