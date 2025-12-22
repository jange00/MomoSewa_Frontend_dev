// Address Service
// Handles all address-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getAddresses = async () => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADDRESSES);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAddressById = async (addressId) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.ADDRESSES}/${addressId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createAddress = async (addressData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ADDRESSES, addressData);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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

export const deleteAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADDRESSES}/${addressId}`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

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
