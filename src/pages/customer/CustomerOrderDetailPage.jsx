import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiClock, 
  FiMapPin, 
  FiPackage, 
  FiCheck, 
  FiTruck,
  FiPrinter,
  FiShoppingBag,
  FiCalendar,
  FiStar
} from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import ConfirmDialog from "../../ui/modals/ConfirmDialog";
import { OrderCardSkeleton } from "../../ui/skeletons";
import { useGet, usePost } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import apiClient from "../../api/client";

const CustomerOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasRedirected = useRef(false);

  // Validate orderId from URL params
  const orderId = id && id !== 'undefined' && id !== 'null' && id.trim() !== '' ? id : null;

  // Redirect if orderId is invalid
  useEffect(() => {
    if (!orderId && !hasRedirected.current) {
      hasRedirected.current = true;
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid order ID in URL, redirecting to orders page');
      }
      navigate('/customer/orders', { replace: true });
    }
  }, [orderId, navigate]);

  // Fetch order from API - only if orderId is valid
  const { data: orderData, isLoading, refetch } = useGet(
    `order-${orderId || 'invalid'}`,
    orderId ? `${API_ENDPOINTS.ORDERS}/${orderId}` : `${API_ENDPOINTS.ORDERS}/invalid`,
    { 
      showErrorToast: true, 
      enabled: !!orderId && orderId !== 'undefined' && orderId !== 'null' // Don't fetch if orderId is invalid
    }
  );

  const order = orderData?.data?.order || orderData?.data || null;
  
  // Extract order items early so we can use it in other hooks
  const rawOrderItems = order ? (Array.isArray(order.items) ? order.items : 
                     Array.isArray(order.orderItems) ? order.orderItems : 
                     []) : [];

  // Fetch all products to enrich order items with product images if needed
  const { data: productsData } = useGet(
    'products-for-orders',
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

  // Debug: Log order data structure in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && order) {
      console.log('=== ORDER DATA DEBUG ===');
      console.log('Full order:', order);
      console.log('Order items:', order.items || order.orderItems);
      if (order.items && order.items.length > 0) {
        console.log('First item structure:', order.items[0]);
        console.log('First item keys:', Object.keys(order.items[0]));
        console.log('First item product:', order.items[0].product);
      }
      console.log('========================');
    }
  }, [order]);

  // Cancel order mutation
  // According to backend: PUT /orders/:id/cancel
  const cancelOrderMutation = usePost('orders', '', {
    showSuccessToast: true,
    showErrorToast: true,
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });

  const handleReorder = () => {
    if (!order) return;
    
    setConfirmDialog({
      isOpen: true,
      title: "Reorder Items",
      message: `Add all items from order #${order.orderId || order._id || order.id} to your cart?`,
      onConfirm: async () => {
        // TODO: Add items to cart via API
        toast.success("Items added to cart! Redirecting to cart...");
        setTimeout(() => {
          navigate("/cart");
        }, 1000);
      },
      variant: "warning",
    });
  };

  const handleCancelOrder = () => {
    if (!order) return;
    
    if (order.status === "pending" || order.status === "preparing") {
      setConfirmDialog({
        isOpen: true,
        title: "Cancel Order",
        message: `Are you sure you want to cancel order #${order.orderId || order._id || order.id}? This action cannot be undone.`,
        onConfirm: async () => {
          try {
            // According to backend: PUT /orders/:id/cancel
            const response = await apiClient.put(
              `${API_ENDPOINTS.ORDERS}/${id}/cancel`,
              { reason: "Cancelled by customer" }
            );
            
            if (response.data.success) {
              toast.success(response.data.message || "Order cancelled successfully");
              // Refetch order to get updated status
              refetch();
            }
          } catch (error) {
            console.error("Failed to cancel order:", error);
            toast.error(error.response?.data?.message || "Failed to cancel order");
          }
        },
        variant: "danger",
      });
    } else {
      toast.error("This order cannot be cancelled");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRateOrder = () => {
    if (!order) return;
    navigate(`/customer/reviews?order=${order.orderId || order._id || order.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <OrderCardSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/customer/orders">
            <Button variant="ghost" size="sm" className="mb-6">
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">Order Not Found</h3>
              <p className="text-charcoal-grey/60 mb-6">
                The order you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/customer/orders">
                <Button variant="primary" size="md">
                  View All Orders
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
  // Use human-readable orderId if available, fallback to _id or id
  const orderIdFromOrder = order.orderId || order._id || order.id;
  const orderDate = order.date || order.createdAt || 'Recently';
  // orderItems is already defined above

  // Helper function to get product image from order item
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

    // First check direct image field on item
    if (item.image) {
      if (typeof item.image === 'string' && item.image.trim() && item.image !== 'null') {
        const trimmed = item.image.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Found image on item.image:', trimmed);
          }
          return trimmed;
        }
      }
    }

    // Check imageUrl on item (legacy)
    if (item.imageUrl) {
      if (typeof item.imageUrl === 'string' && item.imageUrl.trim() && item.imageUrl !== 'null') {
        const trimmed = item.imageUrl.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Found image on item.imageUrl:', trimmed);
          }
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
            if (process.env.NODE_ENV === 'development') {
              console.log('Found image on item.product.image:', trimmed);
            }
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
          if (process.env.NODE_ENV === 'development') {
            console.log('Found image on item.product.images:', validImage.trim());
          }
          return validImage.trim();
        }
      }

      // Check legacy imageUrl
      if (item.product.imageUrl) {
        if (typeof item.product.imageUrl === 'string' && item.product.imageUrl.trim() && item.product.imageUrl !== 'null') {
          const trimmed = item.product.imageUrl.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Found image on item.product.imageUrl:', trimmed);
            }
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/customer/orders">
            <Button variant="ghost" size="sm">
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {(order.status === "pending" || order.status === "preparing") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelOrder}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
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
                Order #{orderIdFromOrder || orderId}
              </h1>
              <p className="text-charcoal-grey/60 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {orderDate}
              </p>
            </div>
            <Badge
              variant={order.status === "delivered" ? "success" : "default"}
              className={`${status.bg} ${status.text} ${status.border} border`}
            >
              {statusLabel}
            </Badge>
          </div>

          {/* Status Progress */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ["pending", "preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0
                  ? "bg-deep-maroon text-white"
                  : "bg-charcoal-grey/20 text-charcoal-grey/40"
              }`}>
                <FiPackage className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-charcoal-grey">Order Placed</p>
                <p className="text-sm text-charcoal-grey/60">{orderDate}</p>
              </div>
            </div>

            {order.status !== "pending" && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ["preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0
                    ? "bg-deep-maroon text-white"
                    : "bg-charcoal-grey/20 text-charcoal-grey/40"
                }`}>
                  <FiShoppingBag className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal-grey">Preparing</p>
                  {order.status === "preparing" && (
                    <p className="text-sm text-charcoal-grey/60">Your order is being prepared</p>
                  )}
                </div>
              </div>
            )}

            {["on-the-way", "delivered"].includes(order.status) && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === "delivered"
                    ? "bg-deep-maroon text-white"
                    : "bg-deep-maroon text-white"
                }`}>
                  <FiTruck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal-grey">On the Way</p>
                  {order.estimatedDelivery && (
                    <p className="text-sm text-charcoal-grey/60">
                      Estimated delivery: {order.estimatedDelivery}
                    </p>
                  )}
                </div>
              </div>
            )}

            {order.status === "delivered" && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <FiCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-charcoal-grey">Delivered</p>
                  {order.deliveredDate && (
                    <p className="text-sm text-charcoal-grey/60">
                      Delivered on: {order.deliveredDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

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
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-charcoal-grey/10 last:border-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10 overflow-hidden">
                    {itemImage ? (
                      <img 
                        src={itemImage} 
                        alt={itemName} 
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.target.style.display = 'none';
                          const emojiSpan = e.target.parentElement.querySelector('.item-emoji-fallback');
                          if (emojiSpan) {
                            emojiSpan.style.display = 'block';
                          }
                        }}
                      />
                    ) : null}
                    <span className={`text-2xl item-emoji-fallback ${itemImage ? 'hidden' : 'block'}`}>
                      {itemEmoji}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-charcoal-grey">{itemName}</h3>
                    <p className="text-sm text-charcoal-grey/60">Quantity: {itemQuantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal-grey">Rs. {itemPrice.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Delivery Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Delivery Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiMapPin className="w-5 h-5 text-deep-maroon" />
              </div>
              <div>
                <p className="text-sm text-charcoal-grey/60 mb-1">Delivery Address</p>
                <p className="font-semibold text-charcoal-grey">
                  {(() => {
                    // Handle different address formats from backend
                    const deliveryAddr = order.deliveryAddress || order.deliveryAddressObj;
                    
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
                {(order.deliveryAddress && typeof order.deliveryAddress === 'object') && (
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
            {(order.notes || order.deliveryNotes || order.instructions) && (
              <div className="pt-3 border-t border-charcoal-grey/10">
                <p className="text-sm text-charcoal-grey/60 mb-1">Delivery Notes</p>
                <p className="text-charcoal-grey">{order.notes || order.deliveryNotes || order.instructions}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-grey/70">Subtotal</span>
              <span className="font-semibold text-charcoal-grey">
                Rs. {(order.subtotal || order.amount || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-grey/70">Delivery Fee</span>
              <span className="font-semibold text-charcoal-grey">
                Rs. {(order.deliveryFee || 0).toFixed(2)}
              </span>
            </div>
            {(order.discount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-semibold">-Rs. {(order.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-charcoal-grey/10 flex justify-between">
              <span className="font-bold text-lg text-charcoal-grey">Total</span>
              <span className="font-black text-xl text-deep-maroon">
                Rs. {(order.total || order.amount || 0).toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-charcoal-grey/10">
              <p className="text-sm text-charcoal-grey/60 mb-1">Payment Method</p>
              <p className="font-semibold text-charcoal-grey">
                {order.paymentMethod || order.payment?.method || 'Not specified'}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {order.status === "delivered" && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={handleReorder}
                className="flex-1"
              >
                <FiShoppingBag className="w-5 h-5" />
                Reorder
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRateOrder}
                className="flex-1"
              >
                <FiStar className="w-5 h-5" />
                Rate Order
              </Button>
            </>
          )}
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
      </div>
    </div>
  );
};

export default CustomerOrderDetailPage;




