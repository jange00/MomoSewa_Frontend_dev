// Payment Service
// Handles all payment-related API calls including eSewa

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Initiate eSewa payment
 * @param {string} orderId - Order ID
 * @param {number} amount - Order total amount
 * @returns {Promise<Object>} Payment initiation response with formData and payment URL
 */
export const initiateEsewaPayment = async (orderId, amount) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ESEWA.INITIATE, {
      orderId: orderId,
      amount: parseFloat(amount), // Ensure it's a number
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify eSewa payment status
 * @param {string} orderId - Order ID
 * @param {number} amount - Payment amount
 * @param {string} refId - eSewa reference ID
 * @param {string} signature - Optional signature from eSewa
 * @returns {Promise<Object>} Payment verification response
 */
export const verifyEsewaPayment = async (orderId, amount, refId, signature = null) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ESEWA.VERIFY, {
      orderId: orderId,
      amount: parseFloat(amount),
      refId: refId,
      signature: signature, // Optional, if eSewa sends it
    });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};









