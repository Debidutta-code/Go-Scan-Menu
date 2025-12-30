import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';
import { setToken, setUser, removeToken, removeUser } from '@/utils/storage.util';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  restaurantId?: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: any;
  };
  message: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    if (response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    
    if (response.data.token) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    removeToken();
    removeUser();
  }

  async getCurrentUser(): Promise<any> {
    return await apiService.get(API_ENDPOINTS.AUTH.ME);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
export default authService;
