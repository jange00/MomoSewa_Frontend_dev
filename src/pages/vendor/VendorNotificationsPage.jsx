import { useState, useEffect, useMemo } from "react";
import { FiBell, FiCheck, FiPackage, FiStar, FiShoppingBag, FiX, FiTruck, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Badge from "../../ui/badges/Badge";
import { NotificationSkeleton, Skeleton } from "../../ui/skeletons";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";
import { markAsRead, markAllAsRead } from "../../services/notificationService";
import { useQueryClient } from "@tanstack/react-query";

const VendorNotificationsPage = () => {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const queryClient = useQueryClient();

  // Fetch notifications from API
  const { data: notificationsData, isLoading, refetch } = useGet(
    'vendor-notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { showErrorToast: true }
  );

  // Update notifications when API data changes
  useEffect(() => {
    if (notificationsData?.success && notificationsData?.data) {
      const notificationsList = Array.isArray(notificationsData.data.notifications) 
        ? notificationsData.data.notifications 
        : Array.isArray(notificationsData.data) 
        ? notificationsData.data 
        : [];
      // Filter to only show vendor notifications (backend should handle this, but double-check)
      const vendorNotifications = notificationsList.filter(
        (n) => !n.recipientRole || n.recipientRole === 'Vendor'
      );
      setNotifications(vendorNotifications);
    }
  }, [notificationsData]);

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
      // Refetch to get updated list
      refetch();
      // Invalidate unread count query
      queryClient.invalidateQueries({ queryKey: ['vendor-notification-unread-count'] });
    },
  });

  const handleMarkAsRead = async (notification) => {
    const notificationId = notification._id || notification.id;
    if (!notificationId) {
      console.error("Notification ID not found");
      return;
    }

    setIsMarkingRead(true);
    try {
      await markAsRead(notificationId);
      // Optimistically update local state
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId || n.id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
      // Invalidate queries to refetch unread count
      queryClient.invalidateQueries({ queryKey: ['vendor-notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
      // Trigger event for header update
      window.dispatchEvent(new Event("vendorNotificationsUpdated"));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error(error.message || "Failed to mark notification as read");
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      // Invalidate queries to refetch unread count
      queryClient.invalidateQueries({ queryKey: ['vendor-notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-notifications'] });
      // Trigger event for header update
      window.dispatchEvent(new Event("vendorNotificationsUpdated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error(error.message || "Failed to mark all notifications as read");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !(n.isRead || n.read || false)).length;

  // Helper function to get notification icon and color based on type
  const getNotificationIcon = (notification) => {
    const type = notification.type?.toLowerCase() || '';
    const data = notification.data || {};
    const status = data.status?.toLowerCase() || '';

    // Order notifications
    if (type === 'order') {
      if (status === 'pending' || status === 'placed' || status === 'new') {
        return { icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' };
      }
      if (status === 'cancelled' || status === 'canceled') {
        return { icon: FiX, color: 'text-red-600', bg: 'bg-red-50' };
      }
      if (status === 'delivered' || status === 'completed') {
        return { icon: FiTruck, color: 'text-green-600', bg: 'bg-green-50' };
      }
      if (status === 'preparing' || status === 'processing' || status === 'confirmed') {
        return { icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-50' };
      }
      if (status === 'ready' || status === 'dispatched' || status === 'shipped') {
        return { icon: FiCheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' };
      }
      return { icon: FiPackage, color: 'text-deep-maroon', bg: 'bg-deep-maroon/10' };
    }

    // Payment notifications
    if (type === 'payment') {
      if (status === 'success' || status === 'completed' || status === 'paid') {
        return { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      }
      if (status === 'failed' || status === 'declined') {
        return { icon: FiX, color: 'text-red-600', bg: 'bg-red-50' };
      }
      if (status === 'pending') {
        return { icon: FiBell, color: 'text-orange-600', bg: 'bg-orange-50' };
      }
      return { icon: FiBell, color: 'text-blue-600', bg: 'bg-blue-50' };
    }

    // Review notifications
    if (type === 'review') {
      return { icon: FiStar, color: 'text-golden-amber', bg: 'bg-golden-amber/10' };
    }

    // Vendor approval notifications
    if (type === 'vendor_approval') {
      if (status === 'approved') {
        return { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      }
      if (status === 'rejected' || status === 'declined') {
        return { icon: FiX, color: 'text-red-600', bg: 'bg-red-50' };
      }
      return { icon: FiBell, color: 'text-orange-600', bg: 'bg-orange-50' };
    }

    // Inventory notifications
    if (type === 'inventory') {
      return { icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-50' };
    }

    // System notifications
    if (type === 'system') {
      return { icon: FiBell, color: 'text-deep-maroon', bg: 'bg-deep-maroon/10' };
    }

    // Default notification icon
    return { icon: FiBell, color: 'text-deep-maroon', bg: 'bg-deep-maroon/10' };
  };

  // Extract order ID from notification if available
  const getOrderId = (notification) => {
    // Check data field first (API structure)
    if (notification.data?.orderId) {
      return notification.data.orderId;
    }
    // Fallback to other possible fields
    return notification.orderId || 
           notification.order?._id || 
           notification.order?.id || 
           null;
  };

  // Extract order display ID (human-readable)
  const getOrderDisplayId = (notification) => {
    // Check data field first (API structure)
    if (notification.data?.orderIdStr) {
      return notification.data.orderIdStr;
    }
    const orderId = getOrderId(notification);
    if (orderId) {
      // If it's a MongoDB ObjectId, show first 8 chars
      return orderId.length > 12 ? orderId.substring(0, 8) : orderId;
    }
    return 'Order';
  };

  // Extract review ID from notification if available
  const getReviewId = (notification) => {
    if (notification.data?.reviewId) {
      return notification.data.reviewId;
    }
    return notification.reviewId || 
           notification.review?._id || 
           notification.review?.id || 
           null;
  };

  // Get customer name from notification
  const getCustomerName = (notification) => {
    // Check data field first
    if (notification.data?.customerName) {
      return notification.data.customerName;
    }
    if (notification.data?.customer?.name) {
      return notification.data.customer.name;
    }
    // Fallback to other possible fields
    return notification.customer?.name || 
           notification.customer?.fullName ||
           notification.order?.customer?.name ||
           notification.order?.customerId?.name ||
           notification.customerName ||
           'Customer';
  };

  // Get product names from notification
  const getProductNames = (notification) => {
    // Check data field first (pre-formatted string)
    if (notification.data?.productNames) {
      return notification.data.productNames;
    }
    
    // Check data.products array
    if (notification.data?.products && Array.isArray(notification.data.products)) {
      const names = notification.data.products
        .slice(0, 2)
        .map(p => p.name || p.productName || p.product?.name)
        .filter(Boolean);
      if (names.length > 0) {
        return notification.data.products.length > 2 
          ? `${names.join(', ')} and ${notification.data.products.length - 2} more`
          : names.join(', ');
      }
    }
    
    // Check data.items array (order items)
    if (notification.data?.items && Array.isArray(notification.data.items)) {
      const names = notification.data.items
        .slice(0, 2)
        .map(item => item.name || item.product?.name || item.productName)
        .filter(Boolean);
      if (names.length > 0) {
        return notification.data.items.length > 2 
          ? `${names.join(', ')} and ${notification.data.items.length - 2} more`
          : names.join(', ');
      }
    }
    
    // Fallback to order structure (populated order object)
    const order = notification.order || notification.data?.order;
    if (!order) return null;

    const items = order.items || order.orderItems || [];
    if (items.length === 0) return null;

    const productNames = items
      .slice(0, 2)
      .map(item => {
        // Handle product reference (populated or just ID)
        if (item.product && typeof item.product === 'object') {
          return item.product.name || item.name || 'Product';
        }
        return item.name || 'Product';
      })
      .filter(Boolean);

    if (productNames.length === 0) return null;
    
    if (items.length > 2) {
      return `${productNames.join(', ')} and ${items.length - 2} more`;
    }
    return productNames.join(', ');
  };


  // Generate vendor-specific notification title and message based on API structure
  const getNotificationContent = (notification) => {
    const type = notification.type?.toLowerCase() || '';
    const data = notification.data || {};
    const status = data.status?.toLowerCase() || '';
    const customerName = getCustomerName(notification);
    const productNames = getProductNames(notification);
    const orderDisplayId = getOrderDisplayId(notification);

    // ORDER NOTIFICATIONS
    if (type === 'order') {
      // New order received
      if (status === 'pending' || status === 'placed' || status === 'new' || !status) {
        return {
          title: 'New Order Received',
          message: productNames 
            ? `New order for ${productNames}`
            : `You have received a new order`,
          subtitle: `Order #${orderDisplayId}`
        };
      }

      // Order confirmed
      if (status === 'confirmed') {
        return {
          title: 'Order Confirmed',
          message: `Order #${orderDisplayId} has been confirmed`,
          subtitle: null
        };
      }

      // Order being prepared
      if (status === 'preparing' || status === 'processing') {
        return {
          title: 'Order in Preparation',
          message: `Order #${orderDisplayId} is being prepared`,
          subtitle: null
        };
      }

      // Order ready
      if (status === 'ready') {
        return {
          title: 'Order Ready',
          message: `Order #${orderDisplayId} is ready for pickup/delivery`,
          subtitle: null
        };
      }

      // Order dispatched/shipped
      if (status === 'dispatched' || status === 'shipped') {
        return {
          title: 'Order Dispatched',
          message: `Order #${orderDisplayId} has been dispatched`,
          subtitle: null
        };
      }

      // Order delivered
      if (status === 'delivered' || status === 'completed') {
        return {
          title: 'Order Delivered',
          message: `Order #${orderDisplayId} has been delivered successfully`,
          subtitle: null
        };
      }

    // Order cancelled
      if (status === 'cancelled' || status === 'canceled') {
        return {
          title: 'Order Cancelled',
          message: `Order #${orderDisplayId} has been cancelled`,
          subtitle: data.cancellationReason ? `Reason: ${data.cancellationReason}` : null
        };
      }

      // Generic order status update
      const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
      return {
        title: 'Order Status Updated',
        message: `Order #${orderDisplayId} status changed to ${statusText}`,
        subtitle: null
      };
    }

    // PAYMENT NOTIFICATIONS
    if (type === 'payment') {
      if (status === 'success' || status === 'completed' || status === 'paid') {
        return {
          title: 'Payment Received',
          message: `Payment received for Order #${orderDisplayId}`,
          subtitle: null
        };
      }

      if (status === 'failed' || status === 'declined') {
        return {
          title: 'Payment Failed',
          message: `Payment failed for Order #${orderDisplayId}`,
          subtitle: null
        };
      }

      if (status === 'pending') {
        return {
          title: 'Payment Pending',
          message: `Payment pending for Order #${orderDisplayId}`,
          subtitle: null
        };
      }

      return {
        title: 'Payment Update',
        message: `Payment update for Order #${orderDisplayId}`,
        subtitle: null
      };
    }

    // REVIEW NOTIFICATIONS
    if (type === 'review') {
      const rating = data.rating || notification.data?.rating;
      const productName = data.productName || notification.data?.productName || 'your product';
      const reviewComment = data.comment || notification.data?.comment;
      
      return {
        title: 'New Review Received',
        message: `You received a ${rating ? `${rating}-star ` : ''}review for ${productName}`,
        subtitle: reviewComment ? `"${reviewComment.substring(0, 50)}${reviewComment.length > 50 ? '...' : ''}"` : null
      };
    }

    // VENDOR APPROVAL NOTIFICATIONS
    if (type === 'vendor_approval') {
      if (status === 'approved') {
        return {
          title: 'Vendor Application Approved',
          message: 'Congratulations! Your vendor application has been approved.',
          subtitle: 'You can now start managing your products and orders.'
        };
      }

      if (status === 'rejected' || status === 'declined') {
        return {
          title: 'Vendor Application Rejected',
          message: 'Your vendor application has been rejected.',
          subtitle: data.rejectionReason ? `Reason: ${data.rejectionReason}` : 'Please contact support for more information.'
        };
      }

      return {
        title: 'Vendor Application Update',
        message: 'Your vendor application status has been updated.',
        subtitle: null
      };
    }

    // INVENTORY NOTIFICATIONS
    if (type === 'inventory') {
      const productName = data.productName || 'Product';
      
      if (status === 'low_stock' || status === 'low') {
        return {
          title: 'Low Stock Alert',
          message: `${productName} is running low on stock`,
          subtitle: data.currentStock ? `Current stock: ${data.currentStock} units` : null
        };
      }

      if (status === 'out_of_stock') {
        return {
          title: 'Out of Stock',
          message: `${productName} is out of stock`,
          subtitle: 'Please restock to continue receiving orders.'
        };
      }

      return {
        title: 'Inventory Update',
        message: `Inventory update for ${productName}`,
        subtitle: null
      };
    }

    // SYSTEM NOTIFICATIONS
    if (type === 'system') {
      return {
        title: notification.title || 'System Notification',
        message: notification.message || 'You have a new system notification',
        subtitle: null
      };
    }

    // DEFAULT: Use API title/message but ensure it's vendor-appropriate
    // If the message is customer-facing, try to make it vendor-appropriate
    let title = notification.title || 'Notification';
    let message = notification.message || 'You have a new notification';
    
    // Transform customer-facing messages to vendor-appropriate ones
    if (message.toLowerCase().includes('your order')) {
      // This shouldn't happen if backend filters correctly, but handle it anyway
      message = message.replace(/your order/i, `Order #${orderDisplayId}`);
    }

    return {
      title,
      message,
      subtitle: orderDisplayId !== 'Order' ? `Order #${orderDisplayId}` : null
    };
  };

  // Format notification date
  const formatNotificationDate = (date) => {
    if (!date) return 'Just now';
    try {
      const notificationDate = new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((now - notificationDate) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return notificationDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton variant="title" className="mb-2 w-48" />
              <Skeleton variant="text" className="w-64" />
            </div>
            <Skeleton variant="button" />
          </div>
          <div className="grid gap-6">
            <NotificationSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Notifications
            </h1>
            <p className="text-charcoal-grey/70">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || isLoading}
              className="px-4 py-2 rounded-xl bg-charcoal-grey/5 text-charcoal-grey/70 hover:bg-charcoal-grey/10 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {markingAllRead ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const notificationId = notification._id || notification.id;
            const isRead = notification.isRead || notification.read;
            const { icon: NotificationIcon, color, bg } = getNotificationIcon(notification);
            const orderId = getOrderId(notification);
            const orderDisplayId = getOrderDisplayId(notification);
            const reviewId = getReviewId(notification);
            const notificationDate = notification.createdAt || notification.date || notification.time;
            const notificationContent = getNotificationContent(notification);

            // Determine if notification is clickable
            const isClickable = orderId || reviewId || notification.type === 'inventory';
            const notificationLink = orderId 
              ? `/vendor/orders/${orderId}`
              : reviewId 
              ? `/vendor/products` // Could link to product reviews page if exists
              : notification.type === 'inventory'
              ? `/vendor/products` // Link to products page for inventory alerts
              : null;

            const NotificationContent = (
              <Card
                key={notificationId || `notification-${notifications.indexOf(notification)}`}
                className={`p-6 transition-all duration-200 ${
                  !isRead ? "border-l-4 border-l-deep-maroon bg-deep-maroon/5" : ""
                } ${isClickable ? "hover:shadow-md cursor-pointer" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10`}>
                    <NotificationIcon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-bold text-charcoal-grey">
                            {notificationContent.title}
                          </h3>
                          {!isRead && (
                            <Badge variant="primary" className="text-xs">New</Badge>
                          )}
                          {orderId && (
                            <Badge variant="default" className="text-xs">
                              Order #{orderDisplayId}
                            </Badge>
                          )}
                          {notification.type && (
                            <Badge 
                              variant="default" 
                              className={`text-xs ${
                                notification.type === 'order' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                notification.type === 'payment' ? 'bg-green-50 text-green-700 border-green-200' :
                                notification.type === 'review' ? 'bg-golden-amber/10 text-golden-amber border-golden-amber/20' :
                                notification.type === 'inventory' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                notification.type === 'vendor_approval' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-charcoal-grey/10 text-charcoal-grey border-charcoal-grey/20'
                              }`}
                            >
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace('_', ' ')}
                            </Badge>
                          )}
                          {reviewId && (
                            <Badge variant="default" className="text-xs bg-golden-amber/10 text-golden-amber border-golden-amber/20">
                              Review
                            </Badge>
                          )}
                        </div>
                        <p className="text-charcoal-grey/70 text-sm mb-1 font-medium">
                          {notificationContent.message}
                        </p>
                        {notificationContent.subtitle && (
                          <p className="text-xs text-charcoal-grey/60 mt-1">
                            {notificationContent.subtitle}
                          </p>
                        )}
                        {isClickable && (
                          <p className="text-xs text-deep-maroon mt-2 font-medium">
                            Click to view details →
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-charcoal-grey/60 whitespace-nowrap">
                        {formatNotificationDate(notificationDate)}
                      </div>
                    </div>
                    {!isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification);
                        }}
                        disabled={isMarkingRead}
                        className="text-sm text-deep-maroon hover:text-deep-maroon/80 flex items-center gap-2 mt-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="w-4 h-4" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );

            // Wrap in Link if clickable
            if (isClickable && notificationLink) {
              return (
                <Link key={notificationId} to={notificationLink}>
                  {NotificationContent}
                </Link>
              );
            }

            return NotificationContent;
          })}
        </div>

        {notifications.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                No notifications
              </h3>
              <p className="text-charcoal-grey/60">
                You're all caught up! Check back later for updates.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorNotificationsPage;

