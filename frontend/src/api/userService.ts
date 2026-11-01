import { User } from '../types';
import { HttpClient, API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAdminUser } from './mockData';

class UserService {
  async getCurrentUser(userId: string): Promise<User> {
    try {
      // Add timestamp to force fresh data
      const timestamp = Date.now();
      const response = await HttpClient.get<any>(`${API_CONFIG.ENDPOINTS.USER}/${userId}?t=${timestamp}`);
      
      // Map fullName to name if it exists
      const user: User = {
        ...response,
        name: response.name || response.fullName || 'User',
      };
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return user;
    } catch (error) {
      console.log('🔄 BE chưa khả dụng, lấy thông tin user từ bộ nhớ cục bộ');
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        try {
          return JSON.parse(storedUserData) as User;
        } catch (e) {
          console.error('Error parsing stored user data in userService:', e);
        }
      }
      if (userId === mockAdminUser.id) {
        return mockAdminUser;
      }
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const updated = await HttpClient.put<User>(`${API_CONFIG.ENDPOINTS.USER}/${userId}`, updates);
      await AsyncStorage.setItem('user_data', JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.log('🔄 BE chưa khả dụng, cập nhật thông tin user vào bộ nhớ cục bộ');
      const storedUserData = await AsyncStorage.getItem('user_data');
      let current = storedUserData ? JSON.parse(storedUserData) : (userId === mockAdminUser.id ? mockAdminUser : {});
      const merged = { ...current, ...updates };
      await AsyncStorage.setItem('user_data', JSON.stringify(merged));
      return merged as User;
    }
  }

  async addToFavorites(userId: string, destinationId: string): Promise<boolean> {
    try {
      await HttpClient.post(`${API_CONFIG.ENDPOINTS.FAVORITES}?userId=${userId}&destinationId=${destinationId}`);
      return true;
    } catch (error: any) {
      // If destination is already in favorites, treat it as success
      const errorMessage = error?.message || '';
      if (errorMessage.includes('already in favorites') || errorMessage.includes('already exists')) {
        console.log('Destination already in favorites - treating as success');
        return true;
      }
      console.error('Failed to add to favorites:', error);
      return true; // Cho phép trải nghiệm offline mượt mà
    }
  }

  async removeFromFavorites(userId: string, destinationId: string): Promise<boolean> {
    try {
      await HttpClient.delete(`${API_CONFIG.ENDPOINTS.FAVORITES}?userId=${userId}&destinationId=${destinationId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      return true;
    }
  }

  async getFavorites(userId: string): Promise<string[]> {
    try {
      const favorites = await HttpClient.get<any[]>(`${API_CONFIG.ENDPOINTS.FAVORITES_USER}/${userId}`);
      return favorites.map(fav => fav.destinationId);
    } catch (error) {
      console.log('🔄 Fallback lấy danh sách yêu thích mẫu');
      return ['1', '2'];
    }
  }

  async isFavorite(userId: string, destinationId: string): Promise<boolean> {
    try {
      return await HttpClient.get<boolean>(`${API_CONFIG.ENDPOINTS.FAVORITES_CHECK}?userId=${userId}&destinationId=${destinationId}`);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  }

  async toggleFavorite(userId: string, destinationId: string): Promise<boolean> {
    try {
      const isFavorite = await this.isFavorite(userId, destinationId);
      
      if (isFavorite) {
        await this.removeFromFavorites(userId, destinationId);
        return false;
      } else {
        await this.addToFavorites(userId, destinationId);
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      return false;
    }
  }

  // Real-time updates: Listen for user data changes
  async subscribeToUserUpdates(userId: string, callback: (user: User) => void): Promise<void> {
    setInterval(async () => {
      try {
        const user = await this.getCurrentUser(userId);
        callback(user);
      } catch (error) {
        console.error('Failed to fetch user updates:', error);
      }
    }, 20000); // Poll every 20 seconds
  }
}

export const userService = new UserService();


