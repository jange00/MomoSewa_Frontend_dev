
 // API Client with Axios
 // Configured with interceptors for automatic token management
 

import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from './config';
import { getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken, clearAuthData } from '../utils/tokenManager';
import { API_ENDPOINTS } from './config';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If data is FormData, remove Content-Type header so axios can set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // These endpoints return 401 for invalid credentials, not expired tokens
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password') ||
                          originalRequest.url?.includes('/auth/verify-email') ||
                          originalRequest.url?.includes('/auth/verify-phone');

    // If error is 401 and we haven't tried to refresh yet, AND it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          // No refresh token, clear auth and redirect to login
          clearAuthData();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh the access token
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken } = response.data.data;
        
        // Store new access token
        const { setAccessToken } = await import('../utils/tokenManager');
        setAccessToken(accessToken);

        // Reconnect socket with new token
        const { reconnectSocket } = await import('../socket/socketClient');
        reconnectSocket(accessToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For auth endpoints with 401, or other errors, just reject
    return Promise.reject(error);
  }
);


 //API Response Handler

export const handleApiResponse = (response) => {
  console.log('API Response:', response);
  console.log('API Response Data:', response.data);
  
  // Check if response has success field
  if (response.data && response.data.success !== undefined) {
    if (response.data.success) {
      return response.data;
    } else {
      // Response indicates failure
      const error = new Error(response.data.message || 'API request failed');
      error.response = response;
      error.details = response.data.details;
      throw error;
    }
  }
  
  // If no success field, assume success if status is 2xx
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  // Otherwise, throw error
  throw new Error(response.data?.message || 'API request failed');
};


 // API Error Handler
 
export const handleApiError = (error) => {
  console.log('API Error:', error);
  console.log('API Error Response:', error.response);
  console.log('API Error Data:', error.response?.data);
  
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    
    // Check for common error status codes
    let errorMessage = data.message || 'An error occurred';
    
    if (status === 401) {
      errorMessage = data.message || 'Invalid email or password. Please check your credentials.';
    } else if (status === 400) {
      errorMessage = data.message || 'Invalid request. Please check your input.';
    } else if (status === 404) {
      errorMessage = data.message || 'Endpoint not found.';
    } else if (status === 500) {
      errorMessage = data.message || 'Server error. Please try again later.';
    }
    
    return {
      message: errorMessage,
      details: data.details || null,
      status,
      success: false,
      response: error.response,
    };
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network error - No response received:', error.request);
    return {
      message: 'Network error. Please check your connection and ensure the backend server is running.',
      details: null,
      status: null,
      success: false,
    };
  } else {
    // Error in request setup
    console.error('Request setup error:', error.message);
    return {
      message: error.message || 'An unexpected error occurred',
      details: null,
      status: null,
      success: false,
    };
  }
};

export default apiClient;
