/**
 * Product Service Example
 * This is an example of how to create additional API services
 * Follow this pattern for other services (orders, cart, etc.)
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get all products
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 * @returns {Promise<Object>} Products response
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product response
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new product (Vendor only)
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product response
 */
export const createProduct = async (productData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS, productData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a product (Vendor only)
 * @param {string} productId - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<Object>} Updated product response
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await apiClient.put(
      `${API_ENDPOINTS.PRODUCTS}/${productId}`,
      productData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a product (Vendor only)
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
