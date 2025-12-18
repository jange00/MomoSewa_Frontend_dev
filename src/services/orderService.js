/**
 * Order Service
 * Handles all order-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get all orders
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise<Object>} Orders response
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order response
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order response
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS, orderData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status (pending, preparing, on-the-way, delivered, cancelled)
 * @returns {Promise<Object>} Updated order response
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    // According to backend: PUT /orders/:id/status
    const response = await apiClient.put(
      `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
      { status }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update order (general update)
 * @param {string} orderId - Order ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated order response
 */
export const updateOrder = async (orderId, updateData) => {
  try {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.ORDERS}/${orderId}`,
      updateData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason (optional)
 * @returns {Promise<Object>} Cancelled order response
 */
export const cancelOrder = async (orderId, reason = '') => {
  try {
    // According to backend: PUT /orders/:id/cancel
    const response = await apiClient.put(
      `${API_ENDPOINTS.ORDERS}/${orderId}/cancel`,
      { reason }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
