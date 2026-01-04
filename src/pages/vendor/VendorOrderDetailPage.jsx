import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiClock, 
  FiUser, 
  FiPhone, 
  FiMapPin, 
  FiPackage, 
  FiCheck, 
  FiX, 
  FiTruck,
  FiPrinter,
  FiMessageSquare,
  FiTrendingUp,
  FiCalendar,
  FiShoppingBag,
  FiMail,
  FiCopy
} from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import { OrderCardSkeleton } from "../../ui/skeletons";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";
import { formatOrderId } from "../../utils/formatOrderId";
import { getPaymentStatusConfig, formatPaymentMethod } from "../../utils/paymentStatus";

const VendorOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order from API
  const { data: orderData, isLoading } = useGet(
    `vendor-order-${id}`,
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
    'products-for-orders-vendor',
    API_ENDPOINTS.PRODUCTS,
    { 
      enabled: !!order && rawOrderItems.length > 0, // Only fetch if we have an order with items
      showErrorToast: false // Don't show error toast for this background fetch
    }
  );

  const products = productsData?.data?.products || productsData?.data || [];

  // Enrich order items with product data (including images) from products array
  const orderItems = useMemo(() => {
    if (!rawOrderItems.length || !products.length) return rawOrderItems;
    
    return rawOrderItems.map(item => {
      // Get productId - handle both object and string formats
      const productId = item.productId?._id || item.productId?.id || item.productId;
      
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

  // Will use direct API call for order status updates

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });

  const [contactModal, setContactModal] = useState({
    isOpen: false,
  });

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

  const handleStatusUpdate = async (newStatus) => {
    if (!order) return;
    
    const orderId = order._id || order.id;

    if (newStatus === "cancelled") {
      setConfirmDialog({
        isOpen: true,
        title: "Cancel Order",
        message: `Are you sure you want to cancel order #${orderId}? This action cannot be undone.`,
        onConfirm: async () => {
          try {
            // According to backend: PUT /orders/:id/status with status: "cancelled"
            const response = await apiClient.put(
              `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
              { status: "cancelled" }
            );
            
            if (response.data.success) {
              toast.success(response.data.message || "Order cancelled successfully");
              window.location.reload();
            }
          } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
          }
        },
        variant: "danger",
      });
      return;
    }

    try {
      // According to backend: PUT /orders/:id/status
      const response = await apiClient.put(
        `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
        { status: newStatus }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Order status updated successfully");
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleContactCustomer = () => {
    if (!order) return;
    setContactModal({ isOpen: true });
  };

  const handleCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("Phone number not available");
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast.error("Email address not available");
    }
  };

  const handleCopyToClipboard = (text, label) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        toast.success(`${label} copied to clipboard!`);
      }).catch(() => {
        toast.error("Failed to copy to clipboard");
      });
    }
  };

  // Handle ESC key and body scroll for contact modal
  useEffect(() => {
    if (contactModal.isOpen) {
      document.body.style.overflow = "hidden";
      
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setContactModal({ isOpen: false });
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [contactModal.isOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrderCardSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Order Not Found</h2>
            <p className="text-charcoal-grey/60 mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/vendor/orders">
              <Button variant="primary" size="md">
                <FiArrowLeft className="w-4 h-4" />
                Back to Orders
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const status = statusColors[order.status] || statusColors.pending;
  const statusLabel = statusLabels[order.status] || order.status;

  const canAccept = order.status === "pending";
  const canReject = order.status === "pending";
  const canStartPreparing = order.status === "pending";
  const canMarkReady = order.status === "preparing";
  const canMarkOnWay = order.status === "preparing";
  const canMarkDelivered = order.status === "on-the-way";

  // Helper function to get item image from various possible locations
  const getItemImage = (item) => {
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Getting image for item:', {
        name: item.name,
        hasImage: !!item.image,
        hasProduct: !!item.product,
        productImage: item.product?.image,
        productImages: item.product?.images,
        itemKeys: Object.keys(item),
        productKeys: item.product ? Object.keys(item.product) : []
      });
    }

    // Check item.image first (direct on item)
    if (item.image) {
      if (typeof item.image === 'string' && item.image.trim() && item.image !== 'null') {
        const trimmed = item.image.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') { console.log('Found image on item.image:', trimmed); }
          return trimmed;
        }
      }
    }

    // Check item.imageUrl (legacy field)
    if (item.imageUrl) {
      if (typeof item.imageUrl === 'string' && item.imageUrl.trim() && item.imageUrl !== 'null') {
        const trimmed = item.imageUrl.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') { console.log('Found image on item.imageUrl:', trimmed); }
          return trimmed;
        }
      }
    }

    // Check nested product object
    if (item.product) {
      // Check product.image
      if (item.product.image) {
        if (typeof item.product.image === 'string' && item.product.image.trim() && item.product.image !== 'null') {
          const trimmed = item.product.image.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            if (process.env.NODE_ENV === 'development') { console.log('Found image on item.product.image:', trimmed); }
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
          if (process.env.NODE_ENV === 'development') { console.log('Found image on item.product.images:', validImage.trim()); }
          return validImage.trim();
        }
      }

      // Check legacy imageUrl
      if (item.product.imageUrl) {
        if (typeof item.product.imageUrl === 'string' && item.product.imageUrl.trim() && item.product.imageUrl !== 'null') {
          const trimmed = item.product.imageUrl.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            if (process.env.NODE_ENV === 'development') { console.log('Found image on item.product.imageUrl:', trimmed); }
            return trimmed;
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('No image found for item:', item.name);
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/vendor/orders">
            <Button variant="ghost" size="sm">
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleContactCustomer}>
              <FiMessageSquare className="w-4 h-4" />
              Contact
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint}>
              <FiPrinter className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Order Status Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-charcoal-grey mb-2">
                Order #{formatOrderId(order)}
              </h1>
              <p className="text-charcoal-grey/60 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {order.date || order.createdAt || 'Recently'}
              </p>
            </div>
            <Badge
              variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "error" : "primary"}
              className={`${status.bg} ${status.text} ${status.border} border`}
            >
              {statusLabel}
            </Badge>
          </div>
        </Card>

        {/* Action Buttons */}
        {(canAccept || canReject || canStartPreparing || canMarkReady || canMarkOnWay || canMarkDelivered) && (
          <Card className="p-6">
            <div className="flex items-center gap-3 flex-wrap">
              {canAccept && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleStatusUpdate("preparing")}
                >
                  <FiCheck className="w-4 h-4" />
                  Accept & Start Preparing
                </Button>
              )}
              {canReject && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => handleStatusUpdate("cancelled")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <FiX className="w-4 h-4" />
                  Reject Order
                </Button>
              )}
              {canStartPreparing && !canAccept && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleStatusUpdate("preparing")}
                >
                  <FiPackage className="w-4 h-4" />
                  Start Preparing
                </Button>
              )}
              {canMarkReady && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleStatusUpdate("on-the-way")}
                >
                  <FiTruck className="w-4 h-4" />
                  Mark Ready for Delivery
                </Button>
              )}
              {canMarkOnWay && !canMarkReady && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleStatusUpdate("on-the-way")}
                >
                  <FiTruck className="w-4 h-4" />
                  Mark On the Way
                </Button>
              )}
              {canMarkDelivered && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleStatusUpdate("delivered")}
                >
                  <FiCheck className="w-4 h-4" />
                  Mark as Delivered
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Completed Order Summary - Show for delivered orders */}
        {order.status === "delivered" && (
          <Card className="p-6 bg-gradient-to-br from-green-50/50 to-white border-2 border-green-200/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FiCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-charcoal-grey">Order Completed Successfully</h2>
                  <p className="text-sm text-charcoal-grey/60">
                    This order has been delivered and completed
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-white/60">
                <p className="text-sm text-charcoal-grey/60 mb-1">Order Value</p>
                <p className="text-lg font-bold text-deep-maroon">
                  Rs. {(order.total || order.amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/60">
                <p className="text-sm text-charcoal-grey/60 mb-1">Items Ordered</p>
                <p className="text-lg font-bold text-charcoal-grey">{order.itemsCount} items</p>
              </div>
              {order.deliveredDate && (
                <div className="p-4 rounded-xl bg-white/60">
                  <p className="text-sm text-charcoal-grey/60 mb-1">Delivered On</p>
                  <p className="text-lg font-bold text-charcoal-grey">{order.deliveredDate.split(" - ")[0]}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-charcoal-grey mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const itemName = item.name || item.product?.name || 'Product';
                  const itemPrice = item.price || item.product?.price || 0;
                  const itemQuantity = item.quantity || 1;
                  const itemImage = getItemImage(item);
                  const itemEmoji = item.emoji || item.product?.emoji || "🥟";
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-charcoal-grey/5 border border-charcoal-grey/10"
                    >
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10 overflow-hidden">
                        {itemImage ? (
                          <img 
                            src={itemImage} 
                            alt={itemName} 
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              // Fallback to emoji if image fails to load
                              e.target.style.display = 'none';
                              const fallback = e.target.nextElementSibling;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <span className={`text-2xl ${itemImage ? 'hidden' : 'block'}`}>
                          {itemEmoji}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-charcoal-grey">{itemName}</h3>
                        <p className="text-sm text-charcoal-grey/60">
                          Quantity: {itemQuantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-deep-maroon">
                          Rs. {itemPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-charcoal-grey/60">
                          Rs. {(itemPrice * itemQuantity).toFixed(2)} total
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Delivery Notes */}
            {order.notes && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-charcoal-grey mb-4">Delivery Notes</h2>
                <p className="text-charcoal-grey/80">{order.notes}</p>
              </Card>
            )}

            {/* Order Timeline - Show for delivered orders */}
            {order.status === "delivered" && order.timeline && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-charcoal-grey mb-6">Order Timeline</h2>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          event.status === "preparing" ? "bg-blue-100 text-blue-700" :
                          event.status === "on-the-way" ? "bg-purple-100 text-purple-700" :
                          event.status === "delivered" ? "bg-green-100 text-green-700" :
                          "bg-charcoal-grey/10 text-charcoal-grey"
                        }`}>
                          {event.status === "pending" && <FiClock className="w-5 h-5" />}
                          {event.status === "preparing" && <FiPackage className="w-5 h-5" />}
                          {event.status === "on-the-way" && <FiTruck className="w-5 h-5" />}
                          {event.status === "delivered" && <FiCheck className="w-5 h-5" />}
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-charcoal-grey/20 my-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-bold text-charcoal-grey">{event.label}</p>
                        <p className="text-sm text-charcoal-grey/60">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-charcoal-grey mb-6">Customer Information</h2>
              
              {/* Customer Order History - Show for delivered orders */}
              {order.status === "delivered" && (order.customer?.totalOrders || order.customerId?.totalOrders) && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-deep-maroon/5 via-golden-amber/5 to-deep-maroon/5 border border-deep-maroon/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                      <FiTrendingUp className="w-5 h-5 text-deep-maroon" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-grey/60">Customer Since</p>
                      <p className="font-bold text-charcoal-grey">
                        {order.customer?.totalOrders || order.customerId?.totalOrders || 0} Orders
                      </p>
                    </div>
                  </div>
                  {(order.customer?.totalSpent || order.customerId?.totalSpent) && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiShoppingBag className="w-4 h-4 text-charcoal-grey/60" />
                      <span className="text-charcoal-grey/70">Total Spent: </span>
                      <span className="font-bold text-deep-maroon">
                        Rs. {(order.customer?.totalSpent || order.customerId?.totalSpent || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-deep-maroon" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-grey/60">Name</p>
                    <p className="font-bold text-charcoal-grey">
                      {order.customer?.name || order.customerId?.name || 'Customer'}
                    </p>
                  </div>
                </div>
                {(order.customer?.phone || order.customerId?.phone) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                      <FiPhone className="w-5 h-5 text-deep-maroon" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-grey/60">Phone</p>
                      <a
                        href={`tel:${order.customer?.phone || order.customerId?.phone}`}
                        className="font-bold text-deep-maroon hover:underline"
                      >
                        {order.customer?.phone || order.customerId?.phone}
                      </a>
                    </div>
                  </div>
                )}
                {(order.customer?.email || order.customerId?.email) && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-deep-maroon" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-grey/60">Email</p>
                      <p className="font-bold text-charcoal-grey">
                        {order.customer?.email || order.customerId?.email}
                      </p>
                    </div>
                  </div>
                )}
                {(order.customer?.address || order.deliveryAddress) && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <FiMapPin className="w-5 h-5 text-deep-maroon" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-grey/60">Delivery Address</p>
                      <p className="font-medium text-charcoal-grey">
                        {(() => {
                          // Handle different address formats from backend
                          const deliveryAddr = order.deliveryAddress || order.deliveryAddressObj || order.customer?.address;
                          
                          // If it's a string, use it directly
                          if (typeof deliveryAddr === 'string') {
                            return deliveryAddr;
                          }
                          
                          // If it's an object, format it properly
                          if (deliveryAddr && typeof deliveryAddr === 'object') {
                            const parts = [];
                            if (deliveryAddr.nearestLandmark) parts.push(deliveryAddr.nearestLandmark);
                            if (deliveryAddr.address) parts.push(deliveryAddr.address);
                            if (deliveryAddr.area) parts.push(deliveryAddr.area);
                            if (deliveryAddr.city) parts.push(deliveryAddr.city);
                            return parts.length > 0 ? parts.join(', ') : 'No address provided';
                          }
                          
                          return 'No address provided';
                        })()}
                      </p>
                      {/* Show additional address details if available */}
                      {order.deliveryAddress && typeof order.deliveryAddress === 'object' && (
                        <div className="mt-2 space-y-1 text-sm text-charcoal-grey/60">
                          {order.deliveryAddress.fullName && (
                            <p><span className="font-semibold">Name:</span> {order.deliveryAddress.fullName}</p>
                          )}
                          {order.deliveryAddress.phone && (
                            <p><span className="font-semibold">Phone:</span> {order.deliveryAddress.phone}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-charcoal-grey mb-6">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-charcoal-grey/80">
                  <span>Subtotal</span>
                  <span>Rs. {(order.subtotal || order.amount || order.total || 0).toFixed(2)}</span>
                </div>
                {(order.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between text-charcoal-grey/80">
                    <span>Delivery Fee</span>
                    <span>Rs. {(order.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                )}
                {(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {(order.discount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-charcoal-grey/10 flex justify-between">
                  <span className="font-bold text-charcoal-grey">Total</span>
                  <span className="font-bold text-deep-maroon text-lg">
                    Rs. {(order.total || order.amount || 0).toFixed(2)}
                  </span>
                </div>
                {/* Payment Information */}
                <div className="pt-3 border-t border-charcoal-grey/10 space-y-3">
                  <div>
                    <p className="text-sm text-charcoal-grey/60 mb-1">Payment Method</p>
                    <p className="font-medium text-charcoal-grey">
                      {formatPaymentMethod(order.paymentMethod || order.payment?.method || 'Not specified')}
                    </p>
                  </div>
                  {order.paymentStatus && (
                    <div>
                      <p className="text-sm text-charcoal-grey/60 mb-1">Payment Status</p>
                      {(() => {
                        const paymentConfig = getPaymentStatusConfig(
                          order.paymentStatus,
                          order.paymentMethod
                        );
                        return (
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${paymentConfig.bg} ${paymentConfig.text} ${paymentConfig.border}`}
                          >
                            {paymentConfig.icon} {paymentConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  {order.esewaTransactionId && (
                    <div>
                      <p className="text-sm text-charcoal-grey/60 mb-1">eSewa Transaction ID</p>
                      <p className="font-mono text-xs text-charcoal-grey/80 break-all">
                        {order.esewaTransactionId}
                      </p>
                    </div>
                  )}
                  {order.khaltiTransactionId && (
                    <div>
                      <p className="text-sm text-charcoal-grey/60 mb-1">Khalti Transaction ID</p>
                      <p className="font-mono text-xs text-charcoal-grey/80 break-all">
                        {order.khaltiTransactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Delivery Information - Show for delivered orders */}
            {order.status === "delivered" && order.deliveredDate && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-charcoal-grey mb-6">Delivery Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                      <FiCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-grey/60">Delivered On</p>
                      <p className="font-bold text-charcoal-grey flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        {order.deliveredDate}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-charcoal-grey/10">
                    <p className="text-sm text-charcoal-grey/60 mb-2">Delivery Status</p>
                    <Badge variant="success" className="inline-flex items-center gap-2">
                      <FiCheck className="w-4 h-4" />
                      Successfully Delivered
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText="Confirm"
          cancelText="Cancel"
          variant={confirmDialog.variant}
        />

        {/* Contact Customer Modal */}
        {contactModal.isOpen && order && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
              onClick={() => setContactModal({ isOpen: false })}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <Card
                className="w-full max-w-md p-6 pointer-events-auto transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-grey/10">
                  <div>
                    <h3 className="text-2xl font-black text-charcoal-grey mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-deep-maroon/10 flex items-center justify-center border border-deep-maroon/20">
                        <FiMessageSquare className="w-5 h-5 text-deep-maroon" />
                      </div>
                      Contact Customer
                    </h3>
                    <p className="text-sm text-charcoal-grey/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-golden-amber"></span>
                      Order #{formatOrderId(order)}
                    </p>
                  </div>
                  <button
                    onClick={() => setContactModal({ isOpen: false })}
                    className="p-2 rounded-lg hover:bg-deep-maroon/10 text-charcoal-grey/60 hover:text-deep-maroon transition-all duration-200 border border-transparent hover:border-deep-maroon/20"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Information */}
                <div className="space-y-4 mb-6">
                  {/* Customer Name */}
                  {(order.customer?.name || order.customerId?.name) && (
                    <div className="flex items-center gap-3 p-4 bg-deep-maroon/5 rounded-xl border border-deep-maroon/20 hover:border-deep-maroon/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-deep-maroon/20">
                        <FiUser className="w-5 h-5 text-deep-maroon" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-charcoal-grey/60 mb-1">Customer Name</p>
                        <p className="font-bold text-charcoal-grey text-lg">
                          {order.customer?.name || order.customerId?.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {(order.customer?.phone || order.customerId?.phone || order.deliveryAddress?.phone) && (
                    <div className="flex items-center gap-3 p-4 bg-deep-maroon/5 rounded-xl border border-deep-maroon/20 hover:border-deep-maroon/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-deep-maroon/20">
                        <FiPhone className="w-5 h-5 text-deep-maroon" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-charcoal-grey/60 mb-1">Phone Number</p>
                        <p className="font-bold text-charcoal-grey text-lg">
                          {order.customer?.phone || order.customerId?.phone || order.deliveryAddress?.phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCall(order.customer?.phone || order.customerId?.phone || order.deliveryAddress?.phone)}
                          className="shadow-md hover:shadow-lg"
                        >
                          <FiPhone className="w-4 h-4" />
                          Call
                        </Button>
                        <button
                          onClick={() => handleCopyToClipboard(
                            order.customer?.phone || order.customerId?.phone || order.deliveryAddress?.phone,
                            "Phone number"
                          )}
                          className="p-2 rounded-lg hover:bg-deep-maroon/10 text-charcoal-grey/60 hover:text-deep-maroon transition-all border border-charcoal-grey/10 hover:border-deep-maroon/20"
                          aria-label="Copy phone number"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {(order.customer?.email || order.customerId?.email) && (
                    <div className="flex items-center gap-3 p-4 bg-golden-amber/5 rounded-xl border border-golden-amber/20 hover:border-golden-amber/30 transition-all duration-300">
                      <div className="w-12 h-12 rounded-full bg-golden-amber/10 flex items-center justify-center flex-shrink-0 border border-golden-amber/20">
                        <FiMail className="w-5 h-5 text-golden-amber" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-charcoal-grey/60 mb-1">Email Address</p>
                        <p className="font-bold text-charcoal-grey break-all text-lg">
                          {order.customer?.email || order.customerId?.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEmail(order.customer?.email || order.customerId?.email)}
                          className="shadow-md hover:shadow-lg"
                        >
                          <FiMail className="w-4 h-4" />
                          Email
                        </Button>
                        <button
                          onClick={() => handleCopyToClipboard(
                            order.customer?.email || order.customerId?.email,
                            "Email address"
                          )}
                          className="p-2 rounded-lg hover:bg-golden-amber/10 text-charcoal-grey/60 hover:text-golden-amber transition-all border border-charcoal-grey/10 hover:border-golden-amber/20"
                          aria-label="Copy email"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delivery Address */}
                  {(() => {
                    const deliveryAddr = order.deliveryAddress || order.deliveryAddressObj;
                    if (!deliveryAddr) return null;

                    let addressText = '';
                    if (typeof deliveryAddr === 'string') {
                      addressText = deliveryAddr;
                    } else if (typeof deliveryAddr === 'object') {
                      const parts = [];
                      if (deliveryAddr.nearestLandmark) parts.push(deliveryAddr.nearestLandmark);
                      if (deliveryAddr.address) parts.push(deliveryAddr.address);
                      if (deliveryAddr.area) parts.push(deliveryAddr.area);
                      if (deliveryAddr.city) parts.push(deliveryAddr.city);
                      addressText = parts.join(', ');
                    }

                    if (!addressText) return null;

                    return (
                      <div className="flex items-start gap-3 p-4 bg-deep-maroon/5 rounded-xl border border-deep-maroon/20 hover:border-deep-maroon/30 transition-all duration-300">
                        <div className="w-12 h-12 rounded-full bg-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-deep-maroon/20 mt-1">
                          <FiMapPin className="w-5 h-5 text-deep-maroon" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-charcoal-grey/60 mb-1">Delivery Address</p>
                          <p className="font-medium text-charcoal-grey text-sm leading-relaxed">
                            {addressText}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(addressText, "Address")}
                          className="p-2 rounded-lg hover:bg-deep-maroon/10 text-charcoal-grey/60 hover:text-deep-maroon transition-all flex-shrink-0 border border-charcoal-grey/10 hover:border-deep-maroon/20"
                          aria-label="Copy address"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-charcoal-grey/10">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setContactModal({ isOpen: false })}
                    className="flex-1 hover:bg-charcoal-grey/5"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorOrderDetailPage;

