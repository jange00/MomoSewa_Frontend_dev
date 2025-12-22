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
    const response = await apiClient.patch(
      `${API_ENDPOINTS.VENDORS}/profile`,
      profileData
    );
    return handleApiResponse(response);
  } catch (error) {
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
