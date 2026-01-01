import { useState, useEffect, useMemo } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { 
  FiBell, 
  FiCheck, 
  FiPackage, 
  FiUsers, 
  FiShoppingBag,
  FiRefreshCw,
  FiFilter,
  FiX,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle
} from "react-icons/fi";
import toast from "react-hot-toast";
import { NotificationSkeleton } from "../../ui/skeletons";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";
import { markAsRead, markAllAsRead } from "../../services/notificationService";
import { useQueryClient } from "@tanstack/react-query";
import { formatOrderId } from "../../utils/formatOrderId";

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  } catch (error) {
    return "Recently";
  }
};

// Helper function to get date section (Today, Yesterday, This Week, Older)
const getDateSection = (dateString) => {
  if (!dateString) return "Older";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const notificationDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (notificationDate.getTime() === today.getTime()) {
      return "Today";
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else if (notificationDate >= thisWeek) {
      return "This Week";
    } else {
      return "Older";
    }
  } catch (error) {
    return "Older";
  }
};

// Get notification icon based on type
const getNotificationIcon = (notification) => {
  const type = notification.type?.toLowerCase() || '';
  const title = (notification.title || '').toLowerCase();
  const message = (notification.message || notification.body || '').toLowerCase();
  
  if (type.includes('order') || title.includes('order') || message.includes('order')) {
    return FiPackage;
  }
  if (type.includes('user') || title.includes('user') || title.includes('customer')) {
    return FiUsers;
  }
  if (type.includes('vendor') || title.includes('vendor')) {
    return FiShoppingBag;
  }
  if (type.includes('success') || title.includes('success')) {
    return FiCheckCircle;
  }
  if (type.includes('error') || type.includes('warning') || title.includes('error') || title.includes('warning')) {
    return FiAlertCircle;
  }
  if (type.includes('info') || title.includes('info')) {
    return FiInfo;
  }
  
  return FiBell;
};

// Helper function to extract and format order ID from notification
const getOrderDisplayId = (notification) => {
  // Check data field first (API structure)
  if (notification.data?.orderIdStr) {
    return notification.data.orderIdStr;
  }
  const orderId = notification.data?.orderId || notification.orderId || notification.order?._id || notification.order?.id;
  if (orderId) {
    return formatOrderId(null, orderId);
  }
  return null;
};

const CustomerNotificationsPage = () => {
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch notifications from API
  const { data: notificationsData, isLoading, error, refetch } = useGet(
    'notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { 
      showErrorToast: false,
      enabled: isAuthenticated,
      refetchOnMount: true,
    }
  );

  const allNotifications = useMemo(() => {
    if (notificationsData?.success && notificationsData?.data) {
      const notificationsList = Array.isArray(notificationsData.data.notifications) 
        ? notificationsData.data.notifications 
        : Array.isArray(notificationsData.data) 
        ? notificationsData.data 
        : [];
      return notificationsList;
    }
    return [];
  }, [notificationsData]);

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      window.dispatchEvent(new Event("customerNotificationsUpdated"));
    },
  });

  // Filter and sort notifications
  const notifications = useMemo(() => {
    let filtered = allNotifications;

    // Apply filter
    if (filter === "unread") {
      filtered = filtered.filter((n) => !(n.isRead || n.read));
    } else if (filter === "read") {
      filtered = filtered.filter((n) => n.isRead || n.read);
    }

    // Apply sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allNotifications, filter, sortBy]);

  // Group notifications by date section
  const groupedNotifications = useMemo(() => {
    const groups = {
      "Today": [],
      "Yesterday": [],
      "This Week": [],
      "Older": []
    };

    notifications.forEach((notification) => {
      const section = getDateSection(notification.createdAt || notification.date || notification.time);
      if (groups[section]) {
        groups[section].push(notification);
      } else {
        groups["Older"].push(notification);
      }
    });

    // Return only sections that have notifications
    return Object.entries(groups).filter(([_, notifications]) => notifications.length > 0);
  }, [notifications]);

  const unreadCount = allNotifications.filter((n) => !(n.isRead || n.read)).length;
  const readCount = allNotifications.filter((n) => n.isRead || n.read).length;

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) {
      toast.error("Notification ID not found");
      return;
    }

    try {
      await markAsRead(notificationId);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      window.dispatchEvent(new Event("customerNotificationsUpdated"));
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error(error.message || "Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      window.dispatchEvent(new Event("customerNotificationsUpdated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error(error.message || "Failed to mark all notifications as read");
    }
  };

  const clearFilters = () => {
    setFilter("all");
    setSortBy("newest");
  };

  const hasActiveFilters = filter !== "all" || sortBy !== "newest";

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-9 w-64 bg-charcoal-grey/10 rounded-lg animate-pulse mb-2"></div>
              <div className="h-5 w-48 bg-charcoal-grey/10 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-charcoal-grey/10 rounded-xl animate-pulse"></div>
          </div>
          
          {/* Notifications Skeleton */}
          <NotificationSkeleton count={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Error Loading Notifications</h2>
            <p className="text-charcoal-grey/70 mb-4">
              {error.message || 'Failed to load notifications. Please check your connection and try again.'}
            </p>
            <Button variant="primary" onClick={() => refetch()}>
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-charcoal-grey">Notifications</h1>
            <p className="text-charcoal-grey/70 mt-1">
              {unreadCount > 0 
                ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}` 
                : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => refetch()}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="primary" 
                size="md" 
            onClick={handleMarkAllAsRead}
              >
                <FiCheck className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 text-center bg-gradient-to-br from-charcoal-grey/5 to-transparent border-charcoal-grey/10">
            <p className="text-sm text-charcoal-grey/60 mb-1">Total</p>
            <p className="text-2xl font-black text-charcoal-grey">{allNotifications.length}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-deep-maroon/5 to-transparent border-deep-maroon/10">
            <p className="text-sm text-charcoal-grey/60 mb-1">Unread</p>
            <p className="text-2xl font-black text-deep-maroon">{unreadCount}</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-transparent border-green-200">
            <p className="text-sm text-charcoal-grey/60 mb-1">Read</p>
            <p className="text-2xl font-black text-green-600">{readCount}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <FiFilter className="w-5 h-5 text-charcoal-grey/60" />
              <span className="text-sm font-semibold text-charcoal-grey">Filter:</span>
              <Button
                variant={filter === "all" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread
              </Button>
              <Button
                variant={filter === "read" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilter("read")}
              >
                Read
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap md:ml-auto">
              <span className="text-sm font-semibold text-charcoal-grey">Sort:</span>
              <Button
                variant={sortBy === "newest" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("newest")}
              >
                Newest
              </Button>
              <Button
                variant={sortBy === "oldest" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("oldest")}
              >
                Oldest
              </Button>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-charcoal-grey/10 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-charcoal-grey/70">Active filters:</span>
                {filter !== "all" && (
                  <span className="px-2.5 py-1 bg-deep-maroon/10 text-deep-maroon rounded-lg text-xs font-medium">
                    {filter}
                  </span>
                )}
                {sortBy !== "newest" && (
                  <span className="px-2.5 py-1 bg-charcoal-grey/10 text-charcoal-grey rounded-lg text-xs font-medium">
                    Sort: {sortBy}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <FiX className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </Card>

        {/* Results Count */}
        {notifications.length > 0 && (
          <div className="text-sm text-charcoal-grey/70">
            Showing <span className="font-bold text-charcoal-grey">{notifications.length}</span> of{" "}
            <span className="font-bold text-charcoal-grey">{allNotifications.length}</span> notifications
            {hasActiveFilters && " (filtered)"}
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-6">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <FiBell className="w-16 h-16 text-charcoal-grey/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">
                {allNotifications.length === 0 
                  ? 'No Notifications' 
                  : 'No Notifications Match Your Filters'}
              </h3>
              <p className="text-charcoal-grey/60 mb-4">
                {allNotifications.length === 0 
                  ? 'You\'re all caught up! New notifications will appear here.' 
                  : 'Try adjusting your filter or sort criteria.'}
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            groupedNotifications.map(([sectionName, sectionNotifications]) => (
              <div key={sectionName} className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-charcoal-grey">{sectionName}</h2>
                  <div className="flex-1 h-px bg-charcoal-grey/20"></div>
                  <span className="text-sm text-charcoal-grey/60">{sectionNotifications.length}</span>
                </div>
                {sectionNotifications.map((notification) => {
                  const notificationId = notification._id || notification.id;
                  if (!notificationId) return null;
                  
                  const isRead = notification.isRead || notification.read;
                  const Icon = getNotificationIcon(notification);
                  const timeAgo = formatTimeAgo(notification.createdAt || notification.date || notification.time);

                  return (
                    <Card
                      key={notificationId}
                      className={`p-6 transition-all duration-300 hover:shadow-lg ${
                        !isRead
                          ? "border-l-4 border-l-deep-maroon bg-deep-maroon/5 hover:bg-deep-maroon/10" 
                          : "hover:bg-charcoal-grey/5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 ${
                          !isRead ? 'ring-2 ring-deep-maroon/20' : ''
                        }`}>
                          <Icon className={`w-6 h-6 ${!isRead ? 'text-deep-maroon' : 'text-charcoal-grey/60'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold text-charcoal-grey ${!isRead ? 'text-lg' : ''}`}>
                                  {notification.title || notification.message?.substring(0, 50) || 'Notification'}
                                </h3>
                                {!isRead && (
                                  <span className="w-2 h-2 rounded-full bg-deep-maroon flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-charcoal-grey/70 mt-1 mb-2">
                                {notification.message || notification.body || notification.content || 'No message'}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-charcoal-grey/60">
                                <span>{timeAgo}</span>
                                {(() => {
                                  const orderDisplayId = getOrderDisplayId(notification);
                                  if (orderDisplayId) {
                                    return (
                                      <>
                                        <span>•</span>
                                        <span className="font-semibold">Order #{orderDisplayId}</span>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                                {notification.type && (
                                  <>
                                    <span>•</span>
                                    <span className="capitalize">{notification.type}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notificationId)}
                              className="hover:bg-green-50 hover:text-green-600"
                              title="Mark as read"
                            >
                              <FiCheck className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerNotificationsPage;
