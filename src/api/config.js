/**
 * API Configuration
 * Base URL and configuration for backend API
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';
// WebSocket URL - use ws:// for development, wss:// for production
// Socket.IO will handle the protocol conversion automatically, but we keep it explicit
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5001';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
  },
  // Users
  USERS: '/users',
  // Vendors
  VENDORS: '/vendors',
  // Products
  PRODUCTS: '/products',
  // Orders
  ORDERS: '/orders',
  // Cart
  CART: '/cart',
  // Addresses
  ADDRESSES: '/addresses',
  // Reviews
  REVIEWS: '/reviews',
  // Notifications
  NOTIFICATIONS: '/notifications',
  // Admin
  ADMIN: '/admin',
  // Payments
  PAYMENTS: '/payments',
  // Promo Codes
  PROMO_CODES: '/promo-codes',
  // Health Check (outside v1 API)
  HEALTH: '/api/health',
};

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds

/**
 * Token expiration times (in milliseconds)
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
};
