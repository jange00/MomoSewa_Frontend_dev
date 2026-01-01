import { useParams, useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { 
  FiArrowLeft, 
  FiClock, 
  FiMapPin, 
  FiPackage, 
  FiUser,
  FiShoppingBag,
  FiPrinter,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Not available';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function to format short date
const formatShortDate = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  } catch (error) {
    return dateString;
  }
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Track image load errors for each item - MUST be at top level before any returns
  const [imageErrors, setImageErrors] = useState(new Set());

  // Fetch order from API
  const { data: orderData, isLoading, error, refetch } = useGet(
    `admin-order-${id}`,
    `${API_ENDPOINTS.ORDERS}/${id}`,
    { showErrorToast: true, enabled: !!id }
  );

  const order = orderData?.data?.order || orderData?.data || null;

  // Extract order items early so we can use it in other hooks
  const rawOrderItems = order ? (Array.isArray(order.items) ? order.items : 
                     Array.isArray(order.orderItems) ? order.orderItems : 
                     []) : [];

  // Fetch all products to enrich order items with product images if needed
  const { data: productsData } = useGet(
    'products-for-orders-admin',
    API_ENDPOINTS.PRODUCTS,
    { 
      enabled: !!order && rawOrderItems.length > 0, // Only fetch if we have an order with items
      showErrorToast: false // Don't show error toast for this background fetch
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Enrich order items with product data (including images) from products array
  const enrichedOrderItems = useMemo(() => {
    if (!rawOrderItems.length || !products.length) return rawOrderItems;
    
    return rawOrderItems.map(item => {
      // Get productId - handle both object and string formats
      const productId = item.productId?._id || item.productId?.id || item.productId || item.product?._id || item.product?.id;
      
      // Find the matching product
      const product = products.find(p => 
        p._id === productId || p.id === productId
      );
      
      if (product) {
        // Merge item with product data, prioritizing item data for name/price (in case it changed)
        return {
          ...item,
          // Add product data for image lookup
          product: {
            ...product,
            // Keep item's name/price if they exist (order-time values)
            name: item.name || product.name,
            price: item.price !== undefined ? item.price : product.price,
          },
          // Also add image directly on item for easier access
          image: product.image || (product.images && product.images[0]) || item.image || null,
          images: product.images || item.images || [],
        };
      }
      
      // If product not found, return item as-is
      return item;
    });
  }, [rawOrderItems, products]);

  // Process order data
  const processedOrder = useMemo(() => {
    if (!order) return null;
    
    const orderId = order._id || order.id;
    const orderDate = order.date || order.createdAt;
    const orderItems = enrichedOrderItems;
    
    // Process customer info
    const customer = order.customer || order.customerId;
    const customerName = customer?.name || (typeof customer === 'string' ? null : 'Customer');
    const customerEmail = customer?.email || null;
    const customerPhone = customer?.phone || null;
    
    // Process vendor info - handle both populated and ID-only cases
    const vendor = order.vendor || order.vendorId;
    let vendorName = null;
    let vendorBusinessName = null;
    let vendorEmail = null;
    let vendorPhone = null;
    
    if (vendor) {
      if (typeof vendor === 'string') {
        // Vendor is just an ID, we can't get details without fetching
        vendorName = null;
      } else {
        vendorBusinessName = vendor.businessName || vendor.storeName || vendor.name;
        vendorName = vendor.name;
        vendorEmail = vendor.email;
        vendorPhone = vendor.phone;
      }
    }
    
    // Process delivery address - handle both string and object formats
    let deliveryAddress = null;
    
    // Check if deliveryAddress is a string
    if (typeof order.deliveryAddress === 'string') {
      deliveryAddress = order.deliveryAddress;
    }
    // Check if deliveryAddress is an object (address object)
    else if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
      const addr = order.deliveryAddress;
      deliveryAddress = [
        addr.fullName,
        addr.address,
        addr.area,
        addr.city,
        addr.district,
        addr.nearestLandmark
      ].filter(Boolean).join(', ');
    }
    // Check deliveryAddressObj
    else if (order.deliveryAddressObj) {
      const addr = order.deliveryAddressObj;
      deliveryAddress = [
        addr.fullName,
        addr.address,
        addr.area,
        addr.city,
        addr.district,
        addr.nearestLandmark
      ].filter(Boolean).join(', ');
    }
    // Check address field
    else if (order.address) {
      if (typeof order.address === 'string') {
        deliveryAddress = order.address;
      } else if (typeof order.address === 'object') {
        const addr = order.address;
        deliveryAddress = [
          addr.fullName,
          addr.address,
          addr.area,
          addr.city,
          addr.district,
          addr.nearestLandmark
        ].filter(Boolean).join(', ');
      }
    }
    
    return {
      ...order,
      orderId,
      orderDate,
      orderItems,
      customerName,
      customerEmail,
      customerPhone,
      vendorName,
      vendorBusinessName,
      vendorEmail,
      vendorPhone,
      deliveryAddress: deliveryAddress || 'No address provided',
    };
  }, [order, enrichedOrderItems]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="h-12 w-64 bg-charcoal-grey/10 rounded-lg animate-pulse mb-2"></div>
          
          {/* Order Summary Skeleton */}
          <Card className="p-6">
            <div className="h-8 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 w-full bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
              <div className="h-6 w-3/4 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
              <div className="h-6 w-1/2 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
            </div>
          </Card>

          {/* Order Items Skeleton */}
          <Card className="p-6">
            <div className="h-8 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-charcoal-grey/10 rounded-lg">
                  <div className="w-20 h-20 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-3/4 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="h-6 w-20 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Customer & Delivery Info Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="h-8 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse mb-6"></div>
              <div className="space-y-3">
                <div className="h-5 w-full bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                <div className="h-5 w-3/4 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                <div className="h-5 w-1/2 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="h-8 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse mb-6"></div>
              <div className="space-y-3">
                <div className="h-5 w-full bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                <div className="h-5 w-3/4 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
                <div className="h-5 w-1/2 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !processedOrder) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="mb-6">
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-charcoal-grey mb-2">Order Not Found</h3>
            <p className="text-charcoal-grey/60 mb-6">
              {error?.message || "The order you're looking for doesn't exist or has been removed."}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/admin/orders">
                <Button variant="primary" size="md">
                  View All Orders
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const orderId = processedOrder.orderId;
  const orderDate = processedOrder.orderDate;
  const orderItems = processedOrder.orderItems;

  // Helper function to get product image from order item
  const getItemImage = (item) => {
    // First check direct image field on item
    if (item.image) {
      if (typeof item.image === 'string' && item.image.trim() && item.image !== 'null') {
        const trimmed = item.image.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
    }

    // Check imageUrl on item (legacy)
    if (item.imageUrl) {
      if (typeof item.imageUrl === 'string' && item.imageUrl.trim() && item.imageUrl !== 'null') {
        const trimmed = item.imageUrl.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
    }

    // Check nested product object
    if (item.product) {
      if (item.product.image) {
        if (typeof item.product.image === 'string' && item.product.image.trim() && item.product.image !== 'null') {
          const trimmed = item.product.image.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            return trimmed;
          }
        }
      }

      // Check product.images array
      if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        const validImage = item.product.images.find(img => {
          if (!img || typeof img !== 'string') return false;
          const trimmed = img.trim();
          return trimmed && trimmed !== 'null' && (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/'));
        });
        if (validImage) {
          return validImage.trim();
        }
      }

      // Check legacy imageUrl
      if (item.product.imageUrl) {
        if (typeof item.product.imageUrl === 'string' && item.product.imageUrl.trim() && item.product.imageUrl !== 'null') {
          const trimmed = item.product.imageUrl.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            return trimmed;
          }
        }
      }
    }

    // Return null if no valid image found
    return null;
  };

  const statusColors = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    preparing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "on-the-way": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };

  const statusLabels = {
    pending: "Pending",
    preparing: "Preparing",
    "on-the-way": "On the Way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const status = statusColors[order.status] || statusColors.pending;
  const statusLabel = statusLabels[order.status] || order.status;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-charcoal-grey">Order #{orderId}</h1>
              <p className="text-charcoal-grey/70 mt-1">Order Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.bg} ${status.text} ${status.border}`}
            >
              {statusLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-charcoal-grey">Order Items</h2>
                <Badge variant="secondary">{orderItems.length} item{orderItems.length !== 1 ? 's' : ''}</Badge>
              </div>
              {orderItems.length > 0 ? (
                <div className="space-y-4">
                  {orderItems.map((item, index) => {
                    const itemName = item.name || item.product?.name || 'Product';
                    const itemPrice = parseFloat(item.price || item.product?.price || 0);
                    const itemQuantity = item.quantity || 1;
                    const itemTotal = itemPrice * itemQuantity;
                    const itemImage = getItemImage(item);
                    const itemKey = item._id || item.id || index;
                    const hasImageError = imageErrors.has(itemKey);
                    const shouldShowImage = itemImage && !hasImageError;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-charcoal-grey/5 rounded-xl hover:bg-charcoal-grey/10 transition-colors">
                        <div className="flex items-center gap-4 flex-1">
                          {shouldShowImage ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10 relative">
                              <img 
                                src={itemImage} 
                                alt={itemName}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setImageErrors(prev => new Set([...prev, itemKey]));
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-deep-maroon/10 to-golden-amber/10 flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10">
                              <span className="text-3xl">{item.emoji || "🥟"}</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-charcoal-grey">{itemName}</h3>
                            <p className="text-sm text-charcoal-grey/60">
                              Quantity: {itemQuantity} × Rs. {itemPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-deep-maroon text-lg">Rs. {itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-charcoal-grey/60">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items found in this order</p>
                </div>
              )}
            </Card>

            {/* Order Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-charcoal-grey mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-deep-maroon/10 flex items-center justify-center flex-shrink-0">
                    <FiPackage className="w-5 h-5 text-deep-maroon" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal-grey">Order Placed</p>
                    <p className="text-sm text-charcoal-grey/60">{formatDate(orderDate)}</p>
                    <p className="text-xs text-charcoal-grey/50 mt-1">{formatShortDate(orderDate)}</p>
                  </div>
                </div>
                {processedOrder.status === 'delivered' && processedOrder.deliveredDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal-grey">Order Delivered</p>
                      <p className="text-sm text-charcoal-grey/60">{formatDate(processedOrder.deliveredDate)}</p>
                    </div>
                  </div>
                )}
                {processedOrder.status === 'cancelled' && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FiXCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal-grey">Order Cancelled</p>
                      <p className="text-sm text-charcoal-grey/60">
                        {processedOrder.cancelledDate ? formatDate(processedOrder.cancelledDate) : 'Cancelled'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-charcoal-grey mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-charcoal-grey/60 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-charcoal-grey mb-1">Delivery Address</p>
                    <p className="text-charcoal-grey/70">{processedOrder.deliveryAddress}</p>
                  </div>
                </div>
                {processedOrder.estimatedDelivery && (
                  <div className="flex items-start gap-3">
                    <FiClock className="w-5 h-5 text-charcoal-grey/60 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-charcoal-grey">Estimated Delivery</p>
                      <p className="text-charcoal-grey/70">{formatDate(processedOrder.estimatedDelivery)}</p>
                    </div>
                  </div>
                )}
                {(processedOrder.notes || processedOrder.deliveryNotes || processedOrder.instructions) && (
                  <div className="flex items-start gap-3">
                    <FiPackage className="w-5 h-5 text-charcoal-grey/60 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-charcoal-grey">Special Notes</p>
                      <p className="text-charcoal-grey/70">
                        {processedOrder.notes || processedOrder.deliveryNotes || processedOrder.instructions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            {(processedOrder.customerName || processedOrder.customer) && (
              <Card className="p-6">
                <h2 className="text-xl font-black text-charcoal-grey mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5" />
                  Customer
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg">
                      {(processedOrder.customerName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-grey">
                        {processedOrder.customerName || 'Customer'}
                      </p>
                    </div>
                  </div>
                  {processedOrder.customerEmail && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiMail className="w-4 h-4" />
                      <span>{processedOrder.customerEmail}</span>
                    </div>
                  )}
                  {processedOrder.customerPhone && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiPhone className="w-4 h-4" />
                      <span>{processedOrder.customerPhone}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Vendor Information */}
            {(processedOrder.vendorBusinessName || processedOrder.vendorName || processedOrder.vendor) && (
              <Card className="p-6">
                <h2 className="text-xl font-black text-charcoal-grey mb-4 flex items-center gap-2">
                  <FiShoppingBag className="w-5 h-5" />
                  Vendor
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-golden-amber to-deep-maroon flex items-center justify-center text-white font-bold text-lg">
                      {(processedOrder.vendorBusinessName || processedOrder.vendorName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-grey">
                        {processedOrder.vendorBusinessName || processedOrder.vendorName || 'Vendor'}
                      </p>
                      {processedOrder.vendorName && processedOrder.vendorName !== processedOrder.vendorBusinessName && (
                        <p className="text-xs text-charcoal-grey/60">{processedOrder.vendorName}</p>
                      )}
                    </div>
                  </div>
                  {processedOrder.vendorEmail && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiMail className="w-4 h-4" />
                      <span>{processedOrder.vendorEmail}</span>
                    </div>
                  )}
                  {processedOrder.vendorPhone && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiPhone className="w-4 h-4" />
                      <span>{processedOrder.vendorPhone}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="p-6 bg-gradient-to-br from-deep-maroon/5 to-golden-amber/5 border-deep-maroon/10">
              <h2 className="text-xl font-black text-charcoal-grey mb-4 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5" />
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-grey/70">Subtotal</span>
                  <span className="font-semibold">
                    Rs. {(processedOrder.subtotal || processedOrder.amount || 0).toFixed(2)}
                  </span>
                </div>
                {(processedOrder.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Delivery Fee</span>
                    <span className="font-semibold">Rs. {(processedOrder.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                )}
                {(processedOrder.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Discount</span>
                    <span className="font-semibold text-green-600">
                      -Rs. {(processedOrder.discount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-charcoal-grey/20 pt-3 flex justify-between items-center">
                  <span className="font-bold text-charcoal-grey text-base">Total</span>
                  <span className="font-black text-deep-maroon text-2xl">
                    Rs. {(processedOrder.total || processedOrder.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-charcoal-grey/10 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Payment Method</span>
                    <span className="font-semibold">
                      {processedOrder.paymentMethod || processedOrder.payment?.method || 'Not specified'}
                    </span>
                  </div>
                  {processedOrder.paymentStatus && (
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-grey/70">Payment Status</span>
                      <Badge 
                        variant={processedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}
                      >
                        {processedOrder.paymentStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;

