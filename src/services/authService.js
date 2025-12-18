/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import axios from 'axios';
import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  clearAuthData,
} from '../utils/tokenManager';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.phone - User's phone number
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role (Customer, Vendor, Admin)
 * @param {string} [userData.businessName] - Business name (for vendors)
 * @param {string} [userData.businessAddress] - Business address (for vendors)
 * @param {string} [userData.businessLicense] - Business license (for vendors)
 * @param {string} [userData.storeName] - Store name (for vendors)
 * @returns {Promise<Object>} Registration response with user and tokens
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    const result = handleApiResponse(response);

    if (result.success && result.data) {
      const user = result.data.user;
      const userRole = user?.role;
      
      // According to backend: Vendor registration creates user as "Customer" initially
      // Role changes to "Vendor" only after admin approval
      // So we need to check if this is a vendor registration by checking the registration data
      const isVendorRegistration = userData.role === 'Vendor' || userData.role === 'vendor' || 
                                   userData.businessName || userData.storeName;
      
      if (isVendorRegistration) {
        // This is a vendor registration - user is created as "Customer" initially
        // Don't auto-login - they need to wait for admin approval
        // Clear any existing auth data
        clearAuthData();
        return {
          ...result,
          requiresApproval: true,
          message: 'Your vendor application has been submitted. Please wait for admin approval before logging in.',
        };
      } else {
        // For customers and other non-vendor registrations, store tokens normally
        setAccessToken(result.data.accessToken);
        setRefreshToken(result.data.refreshToken);
        setUser(result.data.user);
      }
    }

    return result;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Login user with email or phone
 * @param {Object} credentials - Login credentials
 * @param {string} [credentials.email] - User's email
 * @param {string} [credentials.phone] - User's phone number
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login response with user and tokens
 */
export const login = async (credentials) => {
  try {
    console.log('🔐 Login attempt:', { 
      email: credentials.email || 'N/A', 
      phone: credentials.phone || 'N/A',
      hasPassword: !!credentials.password,
      endpoint: `${API_ENDPOINTS.AUTH.LOGIN}`,
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'
    });
    
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    console.log('✅ Login API response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    
    const result = handleApiResponse(response);
    console.log('✅ Login result after handleApiResponse:', result);

    if (result.success && result.data) {
      // Store tokens and user data
      setAccessToken(result.data.accessToken);
      setRefreshToken(result.data.refreshToken);
      setUser(result.data.user);
      console.log('✅ Login successful - Tokens stored, user:', result.data.user);
    } else {
      console.warn('⚠️ Login response indicates failure:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Login error caught:', error);
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error response status:', error.response?.status);
    
    const formattedError = handleApiError(error);
    console.error('❌ Formatted error:', formattedError);
    throw formattedError;
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    // Clear local storage regardless of API response
    clearAuthData();
    return { success: true, message: 'Logout successful' };
  } catch (error) {
    // Clear local storage even if API call fails
    clearAuthData();
    return handleApiError(error);
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
    const result = handleApiResponse(response);

    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
    }

    return result;
  } catch (error) {
    // If refresh fails, clear auth data
    clearAuthData();
    throw handleApiError(error);
  }
};

/**
 * Request password reset
 * @param {Object} data - Password reset request data
 * @param {string} [data.email] - User's email
 * @param {string} [data.phone] - User's phone number
 * @returns {Promise<Object>} Password reset response
 */
export const forgotPassword = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Reset password with token
 * @param {Object} data - Password reset data
 * @param {string} data.token - Reset token from email
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Password reset response
 */
export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify email with token
 * @param {Object} data - Email verification data
 * @param {string} data.token - Verification token
 * @returns {Promise<Object>} Email verification response
 */
export const verifyEmail = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Verify phone with code
 * @param {Object} data - Phone verification data
 * @param {string} data.code - Verification code
 * @returns {Promise<Object>} Phone verification response
 */
export const verifyPhone = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PHONE, data);
    const result = handleApiResponse(response);

    // Update user data if verification successful
    if (result.success && result.data?.user) {
      setUser(result.data.user);
    }

    return result;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Health check endpoint
 * Note: Health check is at /api/health (not under /api/v1)
 * @returns {Promise<Object>} Health check response
 */
export const healthCheck = async () => {
  try {
    // Health check is outside the v1 API, so use full URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5001';
    const response = await axios.get(`${baseUrl}${API_ENDPOINTS.HEALTH}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
