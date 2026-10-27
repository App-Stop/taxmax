// Customer notifications (/notifications). Needs the customer session.

import { apiRequest } from './api';
import { getStoredToken } from './auth';

const call = (path, method = 'GET') => apiRequest(path, { method, token: getStoredToken() });

// Newest first: [{ _id, category, title, body, data, isRead, createdAt }]
export const listNotifications = async () => (await call('/notifications/me')).data;

export const markNotificationRead = async (id) =>
  (await call(`/notifications/${encodeURIComponent(id)}/read`, 'PATCH')).data;

export const markAllNotificationsRead = () => call('/notifications/read-all', 'PATCH');
