// Contact Service
// Handles contact form submissions

import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import { API_ENDPOINTS } from '../api/config';

export const submitContactForm = async (contactData) => {
  try {
    // Prepare request payload - only include defined fields
    const payload = {
      name: contactData.name,
      email: contactData.email,
      message: contactData.message,
    };
    
    // Add optional fields only if they exist
    if (contactData.phone) {
      payload.phone = contactData.phone;
    }
    if (contactData.subject) {
      payload.subject = contactData.subject;
    }
    
    const response = await apiClient.post(API_ENDPOINTS.CONTACT, payload);
    return handleApiResponse(response);
  } catch (error) {
    // Preserve the original axios error structure so ContactPage can access
    // error.response.data.details for validation errors
    if (error.response) {
      // Re-throw the original error to preserve response structure
      throw error;
    }
    
    // For non-response errors, use handleApiError
    const handledError = handleApiError(error);
    const newError = new Error(handledError.message);
    newError.response = handledError.response;
    newError.details = handledError.details;
    throw newError;
  }
};

