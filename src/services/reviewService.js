// Review Service
// Handles all review-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

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

export const getUserReviews = async (params = {}) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.REVIEWS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.REVIEWS, reviewData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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

export const deleteReview = async (reviewId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.REVIEWS}/${reviewId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
