import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { getToken, removeToken } from '@/utils/storage.util';
class ApiService {
    api;
    constructor() {
        this.api = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use((config) => {
            const token = getToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });
        // Response interceptor
        this.api.interceptors.response.use((response) => response.data, (error) => {
            if (error.response?.status === 401) {
                removeToken();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    getApi() {
        return this.api;
    }
    // Generic methods
    get(url, params) {
        return this.api.get(url, { params });
    }
    post(url, data) {
        return this.api.post(url, data);
    }
    put(url, data) {
        return this.api.put(url, data);
    }
    patch(url, data) {
        return this.api.patch(url, data);
    }
    delete(url) {
        return this.api.delete(url);
    }
}
export const apiService = new ApiService();
export default apiService;
