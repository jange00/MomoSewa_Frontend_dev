// Notification Service
// Handles all notification-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const markAsRead = async (notificationId) => {
  try {
    // According to backend: PUT /notifications/:id/read
    const response = await apiClient.put(
      `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const markAllAsRead = async () => {
  try {
    // According to backend: PUT /notifications/read-all
    const response = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
