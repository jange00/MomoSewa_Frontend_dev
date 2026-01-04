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
    console.log('🔄 Initiating eSewa payment...');
    console.log('Endpoint:', API_ENDPOINTS.ESEWA.INITIATE);
    console.log('Payload:', { orderId, amount });
    
    const response = await apiClient.post(API_ENDPOINTS.ESEWA.INITIATE, {
      orderId: orderId,
      amount: parseFloat(amount), // Ensure it's a number
    });
    
    const result = handleApiResponse(response);
    console.log('✅ Payment response received:', result);
    return result;
  } catch (error) {
    console.error('❌ Error initiating eSewa payment:', error);
    throw handleApiError(error);
  }
};

/**
 * Verify eSewa payment status
 * @param {string} orderId - Order ID (from eSewa callback as 'pid')
 * @param {string|number} amount - Payment amount (from eSewa callback as 'amt')
 * @param {string} refId - eSewa reference ID (from eSewa callback)
 * @param {string} signature - Optional signature from eSewa
 * @returns {Promise<Object>} Payment verification response
 */
export const verifyEsewaPayment = async (orderId, amount, refId, signature = null) => {
  try {
    console.log('🔄 Verifying eSewa payment...');
    console.log('Endpoint:', API_ENDPOINTS.ESEWA.VERIFY);
    console.log('Payload:', { 
      orderId, 
      amount: typeof amount === 'string' ? amount : parseFloat(amount), 
      refId, 
      hasSignature: !!signature 
    });
    
    // Prepare payload according to API documentation
    const payload = {
      orderId: String(orderId), // Ensure it's a string
      amount: typeof amount === 'string' ? amount : String(parseFloat(amount)), // Backend expects string or number
      refId: String(refId),
    };
    
    // Add signature if provided
    if (signature) {
      payload.signature = String(signature);
    }
    
    const response = await apiClient.post(API_ENDPOINTS.ESEWA.VERIFY, payload);
    
    const result = handleApiResponse(response);
    console.log('✅ Payment verification response:', result);
    return result;
  } catch (error) {
    console.error('❌ Error verifying eSewa payment:', error);
    throw handleApiError(error);
  }
};









