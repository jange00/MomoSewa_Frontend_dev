/**
 * Vendor Service
 * Handles all vendor-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get vendor approval status (for pending vendors)
 * @returns {Promise<Object>} Vendor approval status response
 */
export const getVendorApprovalStatus = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}/pending-approval`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get vendor profile
 * @returns {Promise<Object>} Vendor profile response
 */
export const getVendorProfile = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}/profile`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update vendor profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile response
 */
export const updateVendorProfile = async (profileData) => {
  try {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.VENDORS}/profile`,
      profileData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get vendor orders
 * Note: Vendors get their orders from /orders endpoint (backend filters by vendor based on auth token)
 * /vendors/orders doesn't exist and causes routing errors (backend treats "orders" as vendor ID)
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 * @returns {Promise<Object>} Orders response
 */
export const getVendorOrders = async (params = {}) => {
  try {
    // Use /orders endpoint - backend will filter by authenticated vendor
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get vendor analytics
 * Note: This endpoint doesn't exist in the backend API
 * Analytics should be calculated from orders data
 * @param {Object} params - Query parameters (dateRange, etc.)
 * @returns {Promise<Object>} Analytics response
 * @deprecated Use orders data to calculate analytics instead
 */
export const getVendorAnalytics = async (params = {}) => {
  // This endpoint doesn't exist - return empty analytics
  // Analytics should be calculated from orders
  console.warn('getVendorAnalytics: This endpoint is not available. Calculate analytics from orders instead.');
  return {
    success: true,
    data: {
      totalOrders: 0,
      activeOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      ordersTrend: 0,
      revenueTrend: 0,
    },
  };
};
