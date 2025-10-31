import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  link?: string;
}

class NotificationsService {
  async getUserNotifications() {
    return apiService.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
  }

  async createNotification(data: CreateNotificationData) {
    return apiService.post<Notification>(API_ENDPOINTS.NOTIFICATIONS, data);
  }

  async markAsRead(id: string) {
    return apiService.patch<Notification>(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`, {
      is_read: true,
    });
  }

  async markAllAsRead() {
    return apiService.patch(API_ENDPOINTS.NOTIFICATIONS + '/mark-all-read', {});
  }
}

export const notificationsService = new NotificationsService();
