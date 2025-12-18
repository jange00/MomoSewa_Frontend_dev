/**
 * Notification Service
 * Handles all notification-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get all notifications
 * @param {Object} params - Query parameters (page, limit, read, etc.)
 * @returns {Promise<Object>} Notifications response
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get unread notifications count
 * @returns {Promise<Object>} Count response
 */
export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Response
 */
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

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Response
 */
export const markAllAsRead = async () => {
  try {
    // According to backend: PUT /notifications/read-all
    const response = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Delete response
 */
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
