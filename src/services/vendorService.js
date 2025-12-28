// Vendor Service
// Handles all vendor-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getVendorApprovalStatus = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}/pending-approval`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getVendorProfile = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.VENDORS}/profile`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateVendorProfile = async (profileData) => {
  try {
    // Try PUT first (more common for profile updates)
    const response = await apiClient.put(
      `${API_ENDPOINTS.VENDORS}/profile`,
      profileData
    );
    return handleApiResponse(response);
  } catch (error) {
    // If PUT fails with 404, provide a more helpful error message
    if (error.response?.status === 404) {
      const helpfulError = new Error(
        'Profile update endpoint not found. Please ensure the backend has implemented PUT /vendors/profile endpoint.'
      );
      helpfulError.response = error.response;
      throw helpfulError;
    }
    throw handleApiError(error);
  }
};

export const getVendorOrders = async (params = {}) => {
  try {
    // Use /orders endpoint - backend will filter by authenticated vendor
    const response = await apiClient.get(API_ENDPOINTS.ORDERS, { params });
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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
