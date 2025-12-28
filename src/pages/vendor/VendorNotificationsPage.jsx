import { useState } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Badge from "../../ui/badges/Badge";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";
import { markAsRead, markAllAsRead } from "../../services/notificationService";

const VendorNotificationsPage = () => {
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Fetch notifications from API
  const { data: notificationsData, isLoading, refetch } = useGet(
    'vendor-notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { showErrorToast: true }
  );

  const notifications = notificationsData?.data?.notifications || notificationsData?.data || [];

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      // Refetch to get updated list
      refetch();
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
      refetch();
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
      refetch();
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
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
            return (
              <Card
                key={notificationId || `notification-${notifications.indexOf(notification)}`}
                className={`p-6 ${!isRead ? "border-l-4 border-l-deep-maroon" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0">
                    <FiBell className="w-6 h-6 text-deep-maroon" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-charcoal-grey">
                            {notification.title}
                          </h3>
                          {!isRead && (
                            <Badge variant="primary">New</Badge>
                          )}
                        </div>
                        <p className="text-charcoal-grey/70 text-sm">
                          {notification.message}
                        </p>
                      </div>
                      <div className="text-xs text-charcoal-grey/60 whitespace-nowrap">
                        {notification.createdAt 
                          ? new Date(notification.createdAt).toLocaleDateString()
                          : notification.time || 'Just now'}
                      </div>
                    </div>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification)}
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

