/**
 * Review Service
 * Handles all review-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get reviews for a product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @returns {Promise<Object>} Reviews response
 */
export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.PRODUCTS}/${productId}/reviews`,
      { params }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get user's reviews
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Reviews response
 */
export const getUserReviews = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.REVIEWS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a review
 * @param {Object} reviewData - Review data (productId, rating, comment, etc.)
 * @returns {Promise<Object>} Created review response
 */
export const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.REVIEWS, reviewData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update a review
 * @param {string} reviewId - Review ID
 * @param {Object} reviewData - Updated review data
 * @returns {Promise<Object>} Updated review response
 */
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.REVIEWS}/${reviewId}`,
      reviewData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
