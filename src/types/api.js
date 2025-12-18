/**
 * API Types and Constants
 * Type definitions and constants for API responses
 */

/**
 * User Roles
 */
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  VENDOR: 'Vendor',
  ADMIN: 'Admin',
};

/**
 * API Response Structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} [data] - Response data
 * @property {string} [message] - Response message
 * @property {string} [details] - Detailed error information (optional)
 */

/**
 * User Object Structure
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {string} name - User's full name
 * @property {string} email - User's email
 * @property {string} phone - User's phone number
 * @property {string} role - User's role (Customer, Vendor, Admin)
 * @property {string|null} profilePicture - Profile picture URL
 * @property {boolean} isEmailVerified - Email verification status
 * @property {boolean} isPhoneVerified - Phone verification status
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} [lastLogin] - Last login timestamp
 */

/**
 * Authentication Response Structure
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} data - Authentication data
 * @property {User} data.user - User object
 * @property {string} data.accessToken - Access token
 * @property {string} data.refreshToken - Refresh token
 * @property {string} message - Response message
 */

/**
 * Registration Data Structure
 * @typedef {Object} RegisterData
 * @property {string} name - User's full name
 * @property {string} email - User's email
 * @property {string} phone - User's phone number
 * @property {string} password - User's password
 * @property {string} role - User's role (Customer, Vendor, Admin)
 * @property {string} [businessName] - Business name (for vendors)
 * @property {string} [businessAddress] - Business address (for vendors)
 * @property {string} [businessLicense] - Business license (for vendors)
 * @property {string} [storeName] - Store name (for vendors)
 */

/**
 * Login Credentials Structure
 * @typedef {Object} LoginCredentials
 * @property {string} [email] - User's email
 * @property {string} [phone] - User's phone number
 * @property {string} password - User's password
 */

/**
 * Error Response Structure
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false
 * @property {string} message - Error message
 * @property {string} [details] - Detailed error information
 * @property {number} [status] - HTTP status code
 */

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Validation Error Structure
 * @typedef {Object} ValidationError
 * @property {string} field - Field name with error
 * @property {string} message - Error message
 */
