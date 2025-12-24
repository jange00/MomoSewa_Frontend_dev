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
    if (!file) {
      throw new Error('No file provided');
    }

    const formData = new FormData();
    // Try 'image' field name (as per original API docs)
    formData.append('image', file);
    
    // Debug: Verify FormData
    console.log('FormData created:', {
      file: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    
    // Verify FormData has the entry
    const formDataEntries = [];
    for (let pair of formData.entries()) {
      formDataEntries.push({ key: pair[0], value: pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1] });
    }
    console.log('FormData entries:', formDataEntries);
    
    // The request interceptor will handle removing Content-Type for FormData
    // Axios will automatically set Content-Type with boundary for FormData
    const response = await apiClient.patch(
      `${API_ENDPOINTS.USERS}/profile/picture`,
      formData
    );
    return handleApiResponse(response);
  } catch (error) {
    console.error('Upload error in userService:', error);
    throw handleApiError(error);
  }
};

export const deleteProfilePicture = async () => {
  try {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.USERS}/profile/picture`
    );
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const changePassword = async (passwordData) => {
  try {
    // Try /users/profile/change-password first (most common pattern for profile operations)
    // If that fails with 404, try /users/change-password
    let response;
    try {
      response = await apiClient.post(
        `${API_ENDPOINTS.USERS}/profile/change-password`,
        passwordData
      );
      return handleApiResponse(response);
    } catch (firstError) {
      const firstStatus = firstError?.response?.status || firstError?.status;
      // If it's 404, try the alternative endpoint
      if (firstStatus === 404) {
        console.log("Profile change-password endpoint not found (404), trying /users/change-password");
        try {
          response = await apiClient.post(
            `${API_ENDPOINTS.USERS}/change-password`,
            passwordData
          );
          return handleApiResponse(response);
        } catch (secondError) {
          // If both return 404, the endpoint doesn't exist on backend
          throw secondError;
        }
      } else {
        // If it's not 404, it's a different error (validation, auth, etc.) - throw it
        throw firstError;
      }
    }
  } catch (error) {
    throw handleApiError(error);
  }
};
