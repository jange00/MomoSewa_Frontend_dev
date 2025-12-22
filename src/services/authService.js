//Authentication Service
// Handles all authentication-related API calls

import axios from 'axios';
import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import {
  setAccessToken,
  setRefreshToken,
  setUser,
  clearAuthData,
} from '../utils/tokenManager';

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
    // console.log('✅ Login result after handleApiResponse:', result);

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
    // console.error('❌ Login error caught:', error);
    // console.error('❌ Error type:', error.constructor.name);
    // console.error('❌ Error response:', error.response);
    // console.error('❌ Error response data:', error.response?.data);
    // console.error('❌ Error response status:', error.response?.status);
    
    const formattedError = handleApiError(error);
    // console.error('❌ Formatted error:', formattedError);
    throw formattedError;
  }
};

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

export const forgotPassword = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const verifyEmail = async (data) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, data);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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
