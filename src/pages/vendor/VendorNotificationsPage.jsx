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
      setNotifications(notificationsList);
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
    const title = (notification.title || '').toLowerCase();
    const message = (notification.message || '').toLowerCase();

    // Check for order-related notifications
    if (type.includes('order') || title.includes('order') || message.includes('order')) {
      if (message.includes('new') || message.includes('placed') || message.includes('received')) {
        return { icon: FiShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' };
      }
      if (message.includes('cancelled') || message.includes('cancel')) {
        return { icon: FiX, color: 'text-red-600', bg: 'bg-red-50' };
      }
      if (message.includes('delivered') || message.includes('delivery')) {
        return { icon: FiTruck, color: 'text-green-600', bg: 'bg-green-50' };
      }
      if (message.includes('preparing') || message.includes('preparation')) {
        return { icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-50' };
      }
      return { icon: FiPackage, color: 'text-deep-maroon', bg: 'bg-deep-maroon/10' };
    }

    // Check for review-related notifications
    if (type.includes('review') || title.includes('review') || message.includes('review') || message.includes('rating')) {
      return { icon: FiStar, color: 'text-golden-amber', bg: 'bg-golden-amber/10' };
    }

    // Default notification icon
    return { icon: FiBell, color: 'text-deep-maroon', bg: 'bg-deep-maroon/10' };
  };

  // Extract order ID from notification if available
  const getOrderId = (notification) => {
    return notification.orderId || notification.order?._id || notification.order?.id || notification.order?._id || null;
  };

  // Extract review ID from notification if available
  const getReviewId = (notification) => {
    return notification.reviewId || notification.review?._id || notification.review?.id || null;
  };

  // Get customer name from notification
  const getCustomerName = (notification) => {
    return notification.customer?.name || 
           notification.customer?.fullName ||
           notification.order?.customer?.name ||
           notification.order?.customerId?.name ||
           notification.customerName ||
           'Customer';
  };

  // Get product names from notification
  const getProductNames = (notification) => {
    const order = notification.order;
    if (!order) return null;

    const items = order.items || order.orderItems || [];
    if (items.length === 0) return null;

    const productNames = items
      .slice(0, 2) // Show max 2 products
      .map(item => item.name || item.product?.name || 'Product')
      .filter(Boolean);

    if (productNames.length === 0) return null;
    
    if (items.length > 2) {
      return `${productNames.join(', ')} and ${items.length - 2} more`;
    }
    return productNames.join(', ');
  };

  // Generate better notification title and message
  const getNotificationContent = (notification) => {
    const type = notification.type?.toLowerCase() || '';
    const title = (notification.title || '').toLowerCase();
    const message = (notification.message || '').toLowerCase();
    const order = notification.order;
    const customerName = getCustomerName(notification);
    const productNames = getProductNames(notification);
    const orderId = getOrderId(notification);
    const orderDisplayId = order?.orderId || orderId?.substring(0, 8) || 'Order';

    // New order notification
    if (type.includes('order') && (title.includes('new') || title.includes('placed') || message.includes('new order') || message.includes('order placed'))) {
      return {
        title: `New Order Received`,
        message: productNames 
          ? `${customerName} placed an order for ${productNames}`
          : `${customerName} placed a new order`,
        subtitle: `Order #${orderDisplayId} • Rs. ${(order?.total || order?.amount || 0).toFixed(2)}`
      };
    }

    // Order cancelled
    if (message.includes('cancelled') || message.includes('cancel')) {
      return {
        title: `Order Cancelled`,
        message: `${customerName} cancelled their order`,
        subtitle: `Order #${orderDisplayId}`
      };
    }

    // Order delivered
    if (message.includes('delivered') || message.includes('delivery')) {
      return {
        title: `Order Delivered`,
        message: `Order #${orderDisplayId} has been delivered to ${customerName}`,
        subtitle: `Total: Rs. ${(order?.total || order?.amount || 0).toFixed(2)}`
      };
    }

    // Order status update
    if (message.includes('status') || message.includes('update')) {
      const status = order?.status || 'updated';
      const statusText = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
      return {
        title: `Order Status Updated`,
        message: `Order #${orderDisplayId} is now ${statusText}`,
        subtitle: `Customer: ${customerName}`
      };
    }

    // Review notification
    if (type.includes('review') || title.includes('review') || message.includes('review') || message.includes('rating')) {
      const review = notification.review;
      const rating = review?.rating || notification.rating;
      const productName = review?.product?.name || notification.productName || 'your product';
      return {
        title: `New Review`,
        message: `${customerName} left a ${rating ? `${rating}-star ` : ''}review for ${productName}`,
        subtitle: review?.comment ? `"${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}"` : null
      };
    }

    // Default: use original but try to enhance
    return {
      title: notification.title || 'Notification',
      message: notification.message || notification.body || notification.content || 'You have a new notification',
      subtitle: orderId ? `Order #${orderDisplayId}` : null
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
            const reviewId = getReviewId(notification);
            const notificationDate = notification.createdAt || notification.date || notification.time;
            const notificationContent = getNotificationContent(notification);

            // Determine if notification is clickable
            const isClickable = orderId || reviewId;
            const notificationLink = orderId 
              ? `/vendor/orders/${orderId}`
              : reviewId 
              ? `/vendor/products` // Could link to product reviews page if exists
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
                              Order #{notification.order?.orderId || orderId?.substring(0, 8)}
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

