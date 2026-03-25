// src/services/api.service.ts
import axiosInstance from '@/shared/services/axios.service';
export class ApiService {
    static async request(endpoint, options = {}, token) {
        try {
            const config = {
                url: endpoint,
                ...options,
                headers: {
                    ...options.headers,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            };
            const response = await axiosInstance(config);
            return response.data;
        }
        catch (error) {
            // Axios errors have a response object
            const errorMessage = error.response?.data?.message || error.message || 'Request failed';
            throw new Error(errorMessage);
        }
    }
    static async login(email, password) {
        return this.request('/superadmin/auth/login', {
            method: 'POST',
            data: { email, password },
        });
    }
    static async register(name, email, password) {
        return this.request('/superadmin/auth/register', {
            method: 'POST',
            data: { name, email, password },
        });
    }
    static async getProfile(token) {
        return this.request('/superadmin/auth/profile', { method: 'GET' }, token);
    }
}
