/**
 * Token Manager Utility
 * Handles storage and retrieval of authentication tokens
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Token Storage - Using sessionStorage for better security
 * Access tokens are stored in memory/sessionStorage
 * Refresh tokens can be stored in httpOnly cookies (backend should handle this)
 */

/**
 * Store access token
 * @param {string} token - Access token
 */
export const setAccessToken = (token) => {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing access token:', error);
  }
};

/**
 * Get access token
 * @returns {string|null} Access token or null
 */
export const getAccessToken = () => {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

/**
 * Remove access token
 */
export const removeAccessToken = () => {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing access token:', error);
  }
};

/**
 * Store refresh token
 * @param {string} token - Refresh token
 */
export const setRefreshToken = (token) => {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null
 */
export const getRefreshToken = () => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Remove refresh token
 */
export const removeRefreshToken = () => {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

/**
 * Store user data
 * @param {Object} user - User object
 */
export const setUser = (user) => {
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get user data
 * @returns {Object|null} User object or null
 */
export const getUser = () => {
  try {
    const userStr = sessionStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUser = () => {
  try {
    sessionStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if access token exists
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};
