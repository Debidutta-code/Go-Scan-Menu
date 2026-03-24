interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin';
}

interface AuthContextType {
  superAdmin: SuperAdmin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}