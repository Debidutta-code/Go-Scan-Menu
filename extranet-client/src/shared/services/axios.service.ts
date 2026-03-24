// src/services/axios.service.ts
import axios from 'axios';
import env from '@/shared/config/env';
import { triggerStaffAuthExpiry } from '@/modules/auth/contexts/StaffAuthContext';

const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if it's an authentication error (401 or 403 with specific message)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const message = error.response.data?.message || '';
      
      // If it's explicitly an authentication failure, trigger the global redirect
      // Skip this for login attempts so we can show "invalid credentials" errors
      const isLoginRequest = error.config?.url?.includes('/staff/login');

      if (
        !isLoginRequest &&
        (error.response.status === 401 || 
         /authentication failed|unauthorized|invalid token|jwt expired|token expired/i.test(message))
      ) {
        console.warn('[AxiosInterceptor] Authentication error detected, triggering logout.');
        triggerStaffAuthExpiry();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
