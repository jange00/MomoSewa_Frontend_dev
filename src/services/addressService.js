/**
 * Address Service
 * Handles all address-related API calls
 */

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

/**
 * Get all user addresses
 * @returns {Promise<Object>} Addresses response
 */
export const getAddresses = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADDRESSES);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get address by ID
 * @param {string} addressId - Address ID
 * @returns {Promise<Object>} Address response
 */
export const getAddressById = async (addressId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ADDRESSES}/${addressId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a new address
 * @param {Object} addressData - Address data
 * @returns {Promise<Object>} Created address response
 */
export const createAddress = async (addressData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ADDRESSES, addressData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update an address
 * @param {string} addressId - Address ID
 * @param {Object} addressData - Updated address data
 * @returns {Promise<Object>} Updated address response
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.ADDRESSES}/${addressId}`,
      addressData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete an address
 * @param {string} addressId - Address ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADDRESSES}/${addressId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Set default address
 * @param {string} addressId - Address ID
 * @returns {Promise<Object>} Response
 */
export const setDefaultAddress = async (addressId) => {
  try {
    // According to backend: PUT /addresses/:id/default
    const response = await apiClient.put(
      `${API_ENDPOINTS.ADDRESSES}/${addressId}/default`
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
