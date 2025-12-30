import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { getToken, removeToken } from '@/utils/storage.util';

class ApiService {
  private api: AxiosInstance;

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

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public getApi(): AxiosInstance {
    return this.api;
  }

  // Generic methods
  public get<T>(url: string, params?: any): Promise<T> {
    return this.api.get(url, { params });
  }

  public post<T>(url: string, data?: any): Promise<T> {
    return this.api.post(url, data);
  }

  public put<T>(url: string, data?: any): Promise<T> {
    return this.api.put(url, data);
  }

  public patch<T>(url: string, data?: any): Promise<T> {
    return this.api.patch(url, data);
  }

  public delete<T>(url: string): Promise<T> {
    return this.api.delete(url);
  }
}

export const apiService = new ApiService();
export default apiService;
