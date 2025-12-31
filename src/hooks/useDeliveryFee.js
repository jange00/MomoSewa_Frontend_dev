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
  const { data: deliveryFeeData, isLoading } = useGet(
    'delivery-fee-settings',
    API_ENDPOINTS.DELIVERY_FEE,
    {
      showErrorToast: false, // Don't show error toast, use defaults instead
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Extract settings with fallback to defaults
  const settings = useMemo(() => {
    if (deliveryFeeData?.data?.settings) {
      return {
        freeDeliveryThreshold: deliveryFeeData.data.settings.freeDeliveryThreshold ?? DEFAULT_SETTINGS.freeDeliveryThreshold,
        deliveryFee: deliveryFeeData.data.settings.deliveryFee ?? DEFAULT_SETTINGS.deliveryFee,
      };
    }
    return DEFAULT_SETTINGS;
  }, [deliveryFeeData]);

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

