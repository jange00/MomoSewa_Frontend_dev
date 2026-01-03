// useDeliveryFee Hook
// Fetches and provides delivery fee settings from the backend

import { useMemo } from 'react';
import { useGet } from './useApi';
import { API_ENDPOINTS } from '../api/config';

const DEFAULT_SETTINGS = {
  freeDeliveryThreshold: 500,
  deliveryFee: 50,
};

export const useDeliveryFee = () => {
  // Fetch delivery fee settings (public endpoint, no auth required)
  // If endpoint doesn't exist (404), gracefully fall back to defaults
  const { data: deliveryFeeData, isLoading, error, isError } = useGet(
    'delivery-fee-settings',
    API_ENDPOINTS.DELIVERY_FEE,
    {
      showErrorToast: false, // Don't show error toast, use defaults instead
      ignore404: true, // Don't treat 404 as error, use defaults instead
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      retry: false, // Don't retry on 404
      retryOnMount: false, // Don't retry on mount if it fails
      enabled: true, // Always try to fetch, but handle 404 gracefully
    }
  );

  // Extract settings with fallback to defaults
  // If endpoint returns 404 or error, use default values
  const settings = useMemo(() => {
    // If data is null (404 with ignore404), use defaults
    if (deliveryFeeData === null) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Delivery fee endpoint not found (404), using default values:', DEFAULT_SETTINGS);
      }
      return DEFAULT_SETTINGS;
    }
    
    // If there's an error, check the status code
    // 404 = endpoint doesn't exist
    // 422 = validation error (endpoint exists but expects different format)
    // Both are acceptable - we'll use defaults silently
    if (isError && error) {
      const errorStatus = error?.status || error?.response?.status;
      // For 404 or 422, use defaults silently (expected behavior)
      if (errorStatus === 404 || errorStatus === 422) {
        // Don't log anything - these are expected errors when endpoint doesn't exist or format differs
        return DEFAULT_SETTINGS;
      }
      // For other unexpected errors, log as warning
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error fetching delivery fee settings, using defaults:', error);
      }
      return DEFAULT_SETTINGS;
    }
    
    // If we have valid data, use it
    if (deliveryFeeData?.data?.settings) {
      return {
        freeDeliveryThreshold: deliveryFeeData.data.settings.freeDeliveryThreshold ?? DEFAULT_SETTINGS.freeDeliveryThreshold,
        deliveryFee: deliveryFeeData.data.settings.deliveryFee ?? DEFAULT_SETTINGS.deliveryFee,
      };
    }
    
    // Default fallback
    return DEFAULT_SETTINGS;
  }, [deliveryFeeData, error, isError]);

  // Calculate delivery fee based on subtotal and discount
  const calculateDeliveryFee = useMemo(() => {
    return (subtotal, discount = 0) => {
      const amountAfterDiscount = subtotal - discount;
      const isFreeDelivery = amountAfterDiscount >= settings.freeDeliveryThreshold;
      return isFreeDelivery ? 0 : settings.deliveryFee;
    };
  }, [settings]);

  // Get amount needed for free delivery
  const getAmountNeededForFreeDelivery = useMemo(() => {
    return (subtotal, discount = 0) => {
      const amountAfterDiscount = subtotal - discount;
      if (amountAfterDiscount >= settings.freeDeliveryThreshold) {
        return 0; // Already qualifies for free delivery
      }
      return settings.freeDeliveryThreshold - amountAfterDiscount;
    };
  }, [settings]);

  return {
    settings,
    isLoading,
    calculateDeliveryFee: calculateDeliveryFee,
    getAmountNeededForFreeDelivery: getAmountNeededForFreeDelivery,
  };
};

