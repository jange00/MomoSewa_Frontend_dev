/**
 * useApi Hook
 * Provides a convenient way to make API calls with React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { handleApiResponse, handleApiError } from '../api/client';
import toast from 'react-hot-toast';

/**
 * Generic hook for GET requests
 * @param {string} key - Query key
 * @param {string} endpoint - API endpoint
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useGet = (key, endpoint, options = {}) => {
  // Extract params from options
  const { params, ...queryOptions } = options;
  
  return useQuery({
    queryKey: [key, params], // Include params in query key for proper caching
    queryFn: async () => {
      try {
        // Support query parameters
        const config = params ? { params } : {};
        const response = await apiClient.get(endpoint, config);
        return handleApiResponse(response);
      } catch (error) {
        const errorData = handleApiError(error);
        // Only show toast if explicitly enabled and not a 404 (which might be expected)
        const isExpected404 = error.response?.status === 404 && options.ignore404;
        if (options.showErrorToast !== false && !isExpected404) {
          toast.error(errorData.message);
        }
        throw errorData;
      }
    },
    enabled: options.enabled !== false,
    ...queryOptions,
  });
};

/**
 * Generic hook for POST requests
 * @param {string} key - Query key (for cache invalidation)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const usePost = (key, endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.post(endpoint, data);
        return handleApiResponse(response);
      } catch (error) {
        const errorData = handleApiError(error);
        if (options.showErrorToast !== false) {
          toast.error(errorData.message);
        }
        throw errorData;
      }
    },
    onSuccess: (data) => {
      if (options.showSuccessToast !== false) {
        toast.success(data.message || 'Operation successful');
      }
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  });
};

/**
 * Generic hook for PUT requests
 * @param {string} key - Query key (for cache invalidation)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const usePut = (key, endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.put(endpoint, data);
        return handleApiResponse(response);
      } catch (error) {
        const errorData = handleApiError(error);
        if (options.showErrorToast !== false) {
          toast.error(errorData.message);
        }
        throw errorData;
      }
    },
    onSuccess: (data) => {
      if (options.showSuccessToast !== false) {
        toast.success(data.message || 'Update successful');
      }
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  });
};

/**
 * Generic hook for PATCH requests
 * @param {string} key - Query key (for cache invalidation)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const usePatch = (key, endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        const response = await apiClient.patch(endpoint, data);
        return handleApiResponse(response);
      } catch (error) {
        const errorData = handleApiError(error);
        if (options.showErrorToast !== false) {
          toast.error(errorData.message);
        }
        throw errorData;
      }
    },
    onSuccess: (data) => {
      if (options.showSuccessToast !== false) {
        toast.success(data.message || 'Update successful');
      }
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  });
};

/**
 * Generic hook for DELETE requests
 * @param {string} key - Query key (for cache invalidation)
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export const useDelete = (key, endpoint, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        const endpointWithId = id ? `${endpoint}/${id}` : endpoint;
        const response = await apiClient.delete(endpointWithId);
        return handleApiResponse(response);
      } catch (error) {
        const errorData = handleApiError(error);
        if (options.showErrorToast !== false) {
          toast.error(errorData.message);
        }
        throw errorData;
      }
    },
    onSuccess: (data) => {
      if (options.showSuccessToast !== false) {
        toast.success(data.message || 'Delete successful');
      }
      if (key) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error);
      }
    },
    ...options,
  });
};

/**
 * Custom hook for making API calls without React Query
 * Useful for one-off calls or when you need more control
 */
export const useApiCall = () => {
  const makeRequest = async (method, endpoint, data = null, config = {}) => {
    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiClient.get(endpoint, config);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, data, config);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data, config);
          break;
        case 'PATCH':
          response = await apiClient.patch(endpoint, data, config);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint, config);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  };

  return { makeRequest };
};
