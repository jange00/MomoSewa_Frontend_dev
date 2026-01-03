/**
 * Formats an order ID to be human-readable
 * @param {string|object} order - Order object or order ID string
 * @param {string} orderId - Optional order ID string (if order is not an object)
 * @returns {string} Human-readable order ID
 */
export const formatOrderId = (order, orderId = null) => {
  // If order is an object, extract the orderId
  if (order && typeof order === 'object') {
    // Priority: order.orderId (human-readable) > order._id > order.id
    const id = order.orderId || order._id || order.id;
    if (!id) return 'N/A';
    
    // If it's already human-readable (starts with "ORD-" or similar format), return as is
    if (typeof id === 'string' && (id.startsWith('ORD-') || id.match(/^[A-Z0-9]+-[A-Z0-9]+$/))) {
      return id;
    }
    
    // If it's a MongoDB ObjectId (24 hex characters), format it nicely
    if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
      // Format as ORD-XXXX-XXXX (first 8 and last 8 characters)
      return `ORD-${id.substring(0, 8).toUpperCase()}-${id.substring(16, 24).toUpperCase()}`;
    }
    
    // If it's a shorter string, format it nicely
    if (typeof id === 'string' && id.length > 8) {
      return `ORD-${id.substring(0, 8).toUpperCase()}`;
    }
    
    // Fallback: return as string
    return String(id);
  }
  
  // If orderId is provided directly
  if (orderId) {
    // If it's already human-readable, return as is
    if (typeof orderId === 'string' && (orderId.startsWith('ORD-') || orderId.match(/^[A-Z0-9]+-[A-Z0-9]+$/))) {
      return orderId;
    }
    
    // If it's a MongoDB ObjectId, format it
    if (typeof orderId === 'string' && orderId.length === 24 && /^[0-9a-fA-F]{24}$/.test(orderId)) {
      return `ORD-${orderId.substring(0, 8).toUpperCase()}-${orderId.substring(16, 24).toUpperCase()}`;
    }
    
    // Fallback
    if (typeof orderId === 'string' && orderId.length > 8) {
      return `ORD-${orderId.substring(0, 8).toUpperCase()}`;
    }
    
    return String(orderId);
  }
  
  // If order is a string directly
  if (typeof order === 'string') {
    // If it's already human-readable, return as is
    if (order.startsWith('ORD-') || order.match(/^[A-Z0-9]+-[A-Z0-9]+$/)) {
      return order;
    }
    
    // If it's a MongoDB ObjectId, format it
    if (order.length === 24 && /^[0-9a-fA-F]{24}$/.test(order)) {
      return `ORD-${order.substring(0, 8).toUpperCase()}-${order.substring(16, 24).toUpperCase()}`;
    }
    
    // Fallback
    if (order.length > 8) {
      return `ORD-${order.substring(0, 8).toUpperCase()}`;
    }
    
    return order;
  }
  
  return 'N/A';
};

/**
 * Gets the display order ID for UI purposes
 * @param {object} order - Order object
 * @returns {string} Display order ID
 */
export const getDisplayOrderId = (order) => {
  if (!order) return 'N/A';
  return formatOrderId(order);
};


