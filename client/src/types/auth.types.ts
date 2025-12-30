// Auth Types
export interface User {
  _id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'branch_manager' | 'manager' | 'waiter' | 'chef' | 'cashier';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  restaurantId: string;
  branchId?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: User['role'];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
