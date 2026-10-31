import { User } from '../types';
import { HttpClient, API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAdminUser } from './mockData';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const normalizedAccount = (credentials.email || '').trim().toLowerCase();
    const isAdminAccount =
      normalizedAccount === 'admin' ||
      normalizedAccount === 'admin@travel.com' ||
      normalizedAccount === 'admin@gmail.com' ||
      normalizedAccount === 'admin@example.com' ||
      normalizedAccount.startsWith('admin@');

    // Hỗ trợ đăng nhập mock admin khi chưa có BE
    if (isAdminAccount && credentials.password === 'admin12345') {
      console.log('🔑 Đăng nhập thành công với tài khoản Mock Admin');
      const mockResponse: AuthResponse = {
        token: 'mock-admin-jwt-token-12345',
        user: mockAdminUser,
        message: 'Đăng nhập Admin thành công',
      };
      await AsyncStorage.setItem('auth_token', mockResponse.token);
      await AsyncStorage.setItem('user_id', mockResponse.user.id);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockResponse.user));
      return mockResponse;
    }

    try {
      const response = await HttpClient.post<any>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      
      // Store token for future requests
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_id', response.user.id);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      // Map fullName to name if it exists
      return {
        ...response,
        user: {
          ...response.user,
          name: response.user.name || response.user.fullName || 'User',
        },
      };
    } catch (error) {
      if (isAdminAccount && credentials.password === 'admin12345') {
        const mockResponse: AuthResponse = {
          token: 'mock-admin-jwt-token-12345',
          user: mockAdminUser,
          message: 'Đăng nhập Admin thành công',
        };
        await AsyncStorage.setItem('auth_token', mockResponse.token);
        await AsyncStorage.setItem('user_id', mockResponse.user.id);
        await AsyncStorage.setItem('user_data', JSON.stringify(mockResponse.user));
        return mockResponse;
      }
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<any>(API_CONFIG.ENDPOINTS.REGISTER, userData);
      
      // Store token for future requests
      if (response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_id', response.user.id);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      // Map fullName to name if it exists
      return {
        ...response,
        user: {
          ...response.user,
          name: response.user.name || response.user.fullName || 'User',
        },
      };
    } catch (error) {
      console.log('🔄 Backend chưa sẵn sàng, lưu tài khoản mock tạm thời');
      const newUser: User = {
        id: `mock_user_${Date.now()}`,
        name: userData.fullName || 'Thành viên mới',
        email: userData.email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        phone: userData.phone || '0988888888',
        dateOfBirth: userData.dateOfBirth,
        nationality: 'Việt Nam',
        favorites: [],
        bookings: [],
        createdAt: new Date().toISOString(),
      };
      const mockResponse: AuthResponse = {
        token: `mock_token_${Date.now()}`,
        user: newUser,
        message: 'Đăng ký tài khoản thành công',
      };
      await AsyncStorage.setItem('auth_token', mockResponse.token);
      await AsyncStorage.setItem('user_id', mockResponse.user.id);
      await AsyncStorage.setItem('user_data', JSON.stringify(mockResponse.user));
      return mockResponse;
    }
  }

  async logout(): Promise<void> {
    // Clear stored auth data
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_id');
    await AsyncStorage.removeItem('user_data');
  }

  // Debug method to clear all stored data
  async clearAsyncStorage(): Promise<void> {
    await AsyncStorage.clear();
  }

  async getCurrentToken(): Promise<string | null> {
    return await AsyncStorage.getItem('auth_token');
  }

  async getCurrentUserId(): Promise<string | null> {
    return await AsyncStorage.getItem('user_id');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getCurrentToken();
    return !!token;
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = await this.getCurrentUserId();
    if (!userId) return null;

    try {
      const user = await HttpClient.get<User>(`${API_CONFIG.ENDPOINTS.USER}/${userId}`);
      if (user) {
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.warn('Backend unavailable, checking local storage for user data');
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        try {
          return JSON.parse(storedUserData) as User;
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      if (userId === mockAdminUser.id) {
        return mockAdminUser;
      }
      // If user not found (404), clear stored data
      if (error instanceof Error && error.message.includes('404')) {
        await this.logout();
      }
      return null;
    }
  }


  async changePassword(userId: string, newPassword: string): Promise<void> {
    await HttpClient.put(`${API_CONFIG.ENDPOINTS.USER}/${userId}/password`, newPassword);
  }

  // Auto-refresh token if needed (for production)
  async refreshToken(): Promise<boolean> {
    try {
      // Implement token refresh logic here
      // This would typically call a refresh endpoint
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
