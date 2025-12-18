/**
 * Cart Service
 * Handles all shopping cart-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get user's cart
 * @returns {Promise<Object>} Cart response
 */
export const getCart = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CART);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add item to cart
 * @param {Object} itemData - Item data (productId, quantity, etc.)
 * @returns {Promise<Object>} Updated cart response
 */
export const addToCart = async (itemData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CART, itemData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update cart item quantity
 * @param {string|number} itemId - Cart item index (according to backend, itemId is the index in the cart array)
 * @param {Object} updateData - Update data (quantity, etc.)
 * @returns {Promise<Object>} Updated cart response
 */
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

/**
 * Remove item from cart
 * @param {string|number} itemId - Cart item index (according to backend, itemId is the index in the cart array)
 * @returns {Promise<Object>} Updated cart response
 */
export const removeFromCart = async (itemId) => {
  try {
    // According to backend: itemId is the index of the item in the cart array
    const response = await apiClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Clear entire cart
 * @returns {Promise<Object>} Response
 */
export const clearCart = async () => {
  try {
    const response = await apiClient.delete(API_ENDPOINTS.CART);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
