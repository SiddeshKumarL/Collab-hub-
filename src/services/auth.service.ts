import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async register(data: RegisterData) {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    if (response.data) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async resetPassword(email: string, newPassword: string) {
    return apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      newPassword,
    });
  }

  async getCurrentUser() {
    const response = await apiService.get<User>(API_ENDPOINTS.AUTH.ME);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();
