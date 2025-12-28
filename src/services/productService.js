// Product Service Example
// This is an example of how to create additional API services
// Follow this pattern for other services (orders, cart, etc.)

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

/**
 * Get subcategories for a specific category
 * @param {string} category - Category name (e.g., "Steamed", "Fried")
 * @returns {Promise<Object>} Subcategories response
 */
export const getSubcategories = async (category) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.PRODUCTS}/subcategories/${category}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload product image
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Upload response with image URL
 */
export const uploadProductImage = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    formData.append('image', file);
    
    console.log('Uploading product image:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
    // Try common upload endpoints - adjust based on your backend
    // Option 1: Dedicated upload endpoint (most common)
    const uploadEndpoints = [
      `${API_ENDPOINTS.PRODUCTS}/upload-image`,
      `${API_ENDPOINTS.PRODUCTS}/upload`,
      `/api/v1/upload/image`, // Generic upload endpoint
    ];
    
    let lastError = null;
    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`Trying upload endpoint: ${endpoint}`);
        const response = await apiClient.post(endpoint, formData);
        const result = handleApiResponse(response);
        console.log('Upload successful via:', endpoint);
        return result;
      } catch (error) {
        console.warn(`Upload failed for ${endpoint}:`, error.response?.status, error.response?.data?.message);
        lastError = error;
        // Continue to next endpoint
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All upload endpoints failed');
  } catch (error) {
    console.error('Product image upload error:', error);
    throw handleApiError(error);
  }
};
