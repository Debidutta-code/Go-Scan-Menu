import apiClient from '../lib/api';
export const authService = {
    // Login
    login: async (credentials) => {
        const response = await apiClient.post('/staff/login', credentials);
        return response.data.data;
    },
    // Register
    register: async (data) => {
        const response = await apiClient.post('/staff/register', data);
        return response.data.data;
    },
    // Get current user
    getCurrentUser: async () => {
        const response = await apiClient.get('/staff/me');
        return response.data.data;
    },
    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
