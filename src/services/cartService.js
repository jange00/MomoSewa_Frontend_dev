// Cart Service
// Handles all shopping cart-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getCart = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CART);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const addToCart = async (itemData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CART, itemData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateCartItem = async (itemId, updateData) => {
  try {
    // According to backend: itemId is the index of the item in the cart array
    const response = await apiClient.put(
      `${API_ENDPOINTS.CART}/${itemId}`,
      updateData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const removeFromCart = async (itemId) => {
  try {
    // According to backend: itemId is the index of the item in the cart array
    const response = await apiClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const clearCart = async () => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.CART);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
