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
  FiStar,
  FiX
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
import { createReview } from "../../services/reviewService";

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

  // Rating modal state - declared early so it can be used in useEffect
  const [ratingModal, setRatingModal] = useState({
    isOpen: false,
    ratings: {}, // { productId: { rating: 5, comment: "" } }
  });

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

  // Handle ESC key and body scroll for rating modal
  useEffect(() => {
    if (ratingModal.isOpen) {
      document.body.style.overflow = "hidden";
      
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          setRatingModal({ isOpen: false, ratings: {} });
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "unset";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [ratingModal.isOpen]);

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
    if (!order || !orderItems.length) return;
    
    // Initialize ratings for all order items
    const initialRatings = {};
    orderItems.forEach(item => {
      const productId = item.productId?._id || item.productId?.id || item.productId;
      if (productId) {
        initialRatings[productId] = {
          rating: 5,
          comment: "",
          productName: item.name || item.product?.name || 'Product',
        };
      }
    });
    
    setRatingModal({
      isOpen: true,
      ratings: initialRatings,
    });
  };

  const handleRatingChange = (productId, rating) => {
    setRatingModal(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [productId]: {
          ...prev.ratings[productId],
          rating,
        },
      },
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setRatingModal(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [productId]: {
          ...prev.ratings[productId],
          comment,
        },
      },
    }));
  };

  const handleSubmitRatings = async () => {
    if (!order) return;

    try {
      const orderId = order._id || order.id;
      const reviewsToSubmit = [];

      // Prepare reviews for each product
      for (const [productId, ratingData] of Object.entries(ratingModal.ratings)) {
        if (ratingData.rating && ratingData.comment.trim()) {
          reviewsToSubmit.push({
            productId,
            orderId,
            rating: ratingData.rating,
            comment: ratingData.comment.trim(),
          });
        }
      }

      if (reviewsToSubmit.length === 0) {
        toast.error("Please add at least one rating with a comment");
        return;
      }

      // Submit all reviews
      const promises = reviewsToSubmit.map(review => createReview(review));
      await Promise.all(promises);

      toast.success(`Successfully submitted ${reviewsToSubmit.length} review${reviewsToSubmit.length > 1 ? 's' : ''}!`);
      setRatingModal({ isOpen: false, ratings: {} });
      
      // Optionally navigate to reviews page
      // navigate('/customer/reviews');
    } catch (error) {
      console.error("Failed to submit reviews:", error);
      toast.error(error.response?.data?.message || "Failed to submit reviews. Please try again.");
    }
  };

  const renderStars = (productId, currentRating, onChange) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="transition-all duration-200 hover:scale-125 active:scale-95"
            aria-label={`Rate ${i + 1} star${i + 1 !== 1 ? 's' : ''}`}
          >
            <FiStar
              className={`w-6 h-6 transition-colors duration-200 ${
                i < currentRating
                  ? "text-golden-amber fill-golden-amber"
                  : "text-charcoal-grey/20 hover:text-golden-amber/50"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-charcoal-grey/70">
          {currentRating} / 5
        </span>
      </div>
    );
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

          {/* Status Progress - Beautiful Timeline */}
          <div className="mt-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-deep-maroon/30 via-golden-amber/20 to-green-500/30"></div>
            
            <div className="space-y-6 relative">
              {/* Order Placed */}
              <div className="flex items-start gap-4 relative group">
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 transform group-hover:scale-110 ${
                    ["pending", "preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0
                      ? "bg-gradient-to-br from-deep-maroon to-deep-maroon/80 shadow-lg shadow-deep-maroon/30 animate-pulse"
                      : "bg-charcoal-grey/20"
                  }`}>
                    {["pending", "preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0 ? "📝" : "📝"}
                  </div>
                  {["pending", "preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <div className="bg-gradient-to-r from-deep-maroon/5 to-transparent rounded-xl p-4 border border-deep-maroon/10 transition-all duration-300 group-hover:shadow-md">
                    <p className="font-bold text-lg text-charcoal-grey mb-1 flex items-center gap-2">
                      <span className="text-xl">🍜</span>
                      Order Placed
                    </p>
                    <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5" />
                      {new Date(orderDate).toLocaleString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preparing */}
              {order.status !== "pending" && (
                <div className="flex items-start gap-4 relative group animate-fadeIn">
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 transform group-hover:scale-110 ${
                      ["preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 animate-bounce"
                        : "bg-charcoal-grey/20"
                    }`}>
                      {["preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0 ? "👨‍🍳" : "👨‍🍳"}
                    </div>
                    {["preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-ping"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`rounded-xl p-4 border transition-all duration-300 group-hover:shadow-md ${
                      ["preparing", "on-the-way", "delivered"].indexOf(order.status) >= 0
                        ? "bg-gradient-to-r from-blue-50 to-transparent border-blue-200"
                        : "bg-charcoal-grey/5 border-charcoal-grey/10"
                    }`}>
                      <p className="font-bold text-lg text-charcoal-grey mb-1 flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        Preparing
                      </p>
                      {order.status === "preparing" ? (
                        <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                          <span className="animate-pulse">⚡</span>
                          Your delicious food is being prepared with love!
                        </p>
                      ) : (
                        <p className="text-sm text-charcoal-grey/70">Your order has been prepared</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* On the Way */}
              {["on-the-way", "delivered"].includes(order.status) && (
                <div className="flex items-start gap-4 relative group animate-fadeIn">
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 transform group-hover:scale-110 ${
                      order.status === "delivered"
                        ? "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30"
                        : "bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse"
                    }`}>
                      🚚
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white animate-ping"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="bg-gradient-to-r from-purple-50 to-transparent rounded-xl p-4 border border-purple-200 transition-all duration-300 group-hover:shadow-md">
                      <p className="font-bold text-lg text-charcoal-grey mb-1 flex items-center gap-2">
                        <span className="text-xl">🏃</span>
                        On the Way
                      </p>
                      {order.estimatedDelivery ? (
                        <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          Estimated delivery: {order.estimatedDelivery}
                        </p>
                      ) : (
                        <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                          <span className="animate-bounce">📦</span>
                          Your order is on its way to you!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivered */}
              {order.status === "delivered" && (
                <div className="flex items-start gap-4 relative group animate-fadeIn">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30 transition-all duration-500 transform group-hover:scale-110 animate-bounce">
                      ✅
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="bg-gradient-to-r from-green-50 to-transparent rounded-xl p-4 border border-green-200 transition-all duration-300 group-hover:shadow-md">
                      <p className="font-bold text-lg text-charcoal-grey mb-1 flex items-center gap-2">
                        <span className="text-xl">🎉</span>
                        Delivered
                      </p>
                      {order.deliveredDate ? (
                        <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                          <FiClock className="w-3.5 h-3.5" />
                          Delivered on: {new Date(order.deliveredDate).toLocaleString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      ) : (
                        <p className="text-sm text-charcoal-grey/70 flex items-center gap-1.5">
                          <span>🍽️</span>
                          Enjoy your meal!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
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

        {/* Rating Modal */}
        {ratingModal.isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300"
              onClick={() => setRatingModal({ isOpen: false, ratings: {} })}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
              <Card
                className="w-full max-w-2xl p-6 pointer-events-auto transform transition-all duration-300 my-8"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-charcoal-grey mb-2 flex items-center gap-2">
                      <span className="text-3xl">⭐</span>
                      Rate Your Order
                    </h3>
                    <p className="text-charcoal-grey/70 text-sm">
                      Share your experience with us! Rate each item from your order.
                    </p>
                  </div>
                  <button
                    onClick={() => setRatingModal({ isOpen: false, ratings: {} })}
                    className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60 hover:text-charcoal-grey transition-all duration-200"
                    aria-label="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Rating Items */}
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {orderItems.map((item, index) => {
                    const productId = item.productId?._id || item.productId?.id || item.productId;
                    if (!productId || !ratingModal.ratings[productId]) return null;

                    const ratingData = ratingModal.ratings[productId];
                    const itemImage = getItemImage(item);
                    const itemEmoji = item.emoji || item.product?.emoji || "🥟";

                    return (
                      <div
                        key={productId || index}
                        className="bg-gradient-to-r from-golden-amber/5 to-transparent rounded-xl p-5 border border-golden-amber/20 hover:border-golden-amber/40 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          {/* Product Image/Emoji */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10 overflow-hidden">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={ratingData.productName}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <span className="text-3xl">{itemEmoji}</span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-charcoal-grey mb-1">
                              {ratingData.productName}
                            </h4>
                            <p className="text-sm text-charcoal-grey/60">
                              Quantity: {item.quantity || 1} × Rs. {(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                            Your Rating
                          </label>
                          {renderStars(productId, ratingData.rating, (newRating) =>
                            handleRatingChange(productId, newRating)
                          )}
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                            Your Review <span className="text-charcoal-grey/50">(optional but recommended)</span>
                          </label>
                          <textarea
                            value={ratingData.comment}
                            onChange={(e) => handleCommentChange(productId, e.target.value)}
                            placeholder="Share your thoughts about this product..."
                            className="w-full px-4 py-3 border border-charcoal-grey/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white resize-none transition-all duration-300"
                            rows={3}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-charcoal-grey/10">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setRatingModal({ isOpen: false, ratings: {} })}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitRatings}
                    className="flex-1 bg-gradient-to-r from-golden-amber to-golden-amber/80 hover:from-golden-amber/90 hover:to-golden-amber/70"
                  >
                    <FiStar className="w-5 h-5" />
                    Submit Reviews
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

export default CustomerOrderDetailPage;




