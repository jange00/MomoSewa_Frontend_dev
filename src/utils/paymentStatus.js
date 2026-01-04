// Payment Status Utility Functions
// Reusable functions for payment status display

/**
 * Get payment status badge configuration
 * @param {string} status - Payment status (paid, pending, failed, refunded)
 * @param {string} method - Payment method (esewa, khalti, cash-on-delivery, card)
 * @returns {Object} Badge configuration with colors and label
 */
export const getPaymentStatusConfig = (status, method) => {
  const statusConfig = {
    paid: { 
      label: 'Paid', 
      bg: 'bg-green-50', 
      text: 'text-green-700', 
      border: 'border-green-200',
      icon: '✅'
    },
    pending: { 
      label: method === 'cash-on-delivery' ? 'Pay on Delivery' : 'Payment Pending', 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-700', 
      border: 'border-yellow-200',
      icon: '⏳'
    },
    failed: { 
      label: 'Payment Failed', 
      bg: 'bg-red-50', 
      text: 'text-red-700', 
      border: 'border-red-200',
      icon: '❌'
    },
    refunded: { 
      label: 'Refunded', 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      border: 'border-gray-200',
      icon: '↩️'
    }
  };
  
  return statusConfig[status] || statusConfig.pending;
};

/**
 * Format payment method name for display
 * @param {string} method - Payment method
 * @returns {string} Formatted payment method name
 */
export const formatPaymentMethod = (method) => {
  const methodNames = {
    'esewa': 'eSewa',
    'khalti': 'Khalti',
    'cash-on-delivery': 'Cash on Delivery',
    'card': 'Credit/Debit Card'
  };
  
  return methodNames[method] || method;
};




