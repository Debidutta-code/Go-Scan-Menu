// src/services/staff.service.ts
import axiosInstance from '@/shared/services/axios.service';
export class StaffService {
    static getHeaders(token) {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    static async request(endpoint, options = {}, token) {
        try {
            const config = {
                url: endpoint,
                ...options,
                headers: {
                    ...options.headers,
                    ...this.getHeaders(token),
                },
            };
            const response = await axiosInstance(config);
            return response.data;
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Request failed';
            throw new Error(message);
        }
    }
    static async login(email, password) {
        return this.request('/staff/login', {
            method: 'POST',
            data: { email, password },
        });
    }
    static async createStaff(token, payload) {
        return this.request('/staff', {
            method: 'POST',
            data: payload,
        }, token);
    }
    static async getStaffByRestaurant(token, restaurantId, page = 1, limit = 10, filter = {}) {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            filter: JSON.stringify(filter),
        });
        return this.request(`/staff/restaurant/${restaurantId}?${queryParams.toString()}`, { method: 'GET' }, token);
    }
    static async getStaff(token, staffId) {
        return this.request(`/staff/${staffId}`, { method: 'GET' }, token);
    }
    static async updateStaff(token, staffId, data) {
        return this.request(`/staff/${staffId}`, {
            method: 'PUT',
            data: data,
        }, token);
    }
    static async updateProfile(token, data) {
        return this.request(`/staff/profile`, {
            method: 'PUT',
            data: data,
        }, token);
    }
    static async updateStaffType(token, staffId, staffType) {
        return this.request(`/staff/${staffId}/staff-type`, {
            method: 'PUT',
            data: { staffType },
        }, token);
    }
    static async deleteStaff(token, staffId) {
        return this.request(`/staff/${staffId}`, {
            method: 'DELETE',
        }, token);
    }
    static async getCurrentUser(token) {
        return this.request('/staff/me', { method: 'GET' }, token);
    }
    static async changePassword(token, currentPassword, newPassword) {
        return this.request('/staff/change-password', {
            method: 'POST',
            data: { currentPassword, newPassword },
        }, token);
    }
}
