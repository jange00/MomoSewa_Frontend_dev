// User Service
// Handles all user profile-related API calls

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const getProfile = async () => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS}/profile`);
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.patch(
      `${API_ENDPOINTS.USERS}/profile`,
      profileData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await apiClient.patch(
      `${API_ENDPOINTS.USERS}/profile/picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.USERS}/change-password`,
      passwordData
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};
