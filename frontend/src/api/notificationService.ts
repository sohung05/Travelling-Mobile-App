import { HttpClient, API_CONFIG } from './config';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'review' | 'system';
  read: boolean;
  createdAt: string;
  relatedId?: string; // booking ID, destination ID, etc.
}

class NotificationService {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      return await HttpClient.get<Notification[]>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${userId}`);
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await HttpClient.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, {});
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await HttpClient.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${userId}/read-all`, {});
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await HttpClient.delete(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService();

