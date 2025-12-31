// Payment Service
// Handles all payment-related API calls including eSewa

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Initiate eSewa payment
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Payment initiation response with payment URL
 */
export const initiateEsewaPayment = async (orderId) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ESEWA.INITIATE, {
      orderId: orderId,
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify eSewa payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} Payment verification response
 */
export const verifyEsewaPayment = async (transactionId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ESEWA.VERIFY}/${transactionId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};


