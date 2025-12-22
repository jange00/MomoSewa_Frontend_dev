// Order Service
// Handles all order-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ORDERS}/${orderId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ORDERS, orderData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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
