export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
}

export interface AuthContextType {
  superAdmin: SuperAdmin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}