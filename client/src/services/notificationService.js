import api from './api';

export const getNotifications = (limit) =>
  api.get('/notifications', { params: limit ? { limit } : {} }).then(res => res.data);

export const markAsRead = (notificationId) =>
  api.put('/notifications/mark-read', notificationId ? { notificationId } : {}).then(res => res.data);

export const getNotificationSettings = () =>
  api.get('/auth/settings/notifications').then(res => res.data);

export const updateNotificationSettings = (settings) =>
  api.put('/auth/settings/notifications', settings).then(res => res.data);

// Returns a native EventSource for SSE. Caller must handle token manually.
export const createNotificationStream = (token) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  return new EventSource(`${baseURL}/notifications/stream?token=${token}`);
};

export default {
  getNotifications,
  markAsRead,
  getNotificationSettings,
  updateNotificationSettings,
  createNotificationStream
};
