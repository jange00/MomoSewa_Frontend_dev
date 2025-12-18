import { useState, useEffect } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Badge from "../../ui/badges/Badge";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";

const CustomerNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();
  
  // Fetch notifications from API
  const { data: notificationsData, isLoading, refetch } = useGet(
    'notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { 
      showErrorToast: true,
      enabled: isAuthenticated, // Only fetch when authenticated
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  // Mark as read mutation
  const markAsReadMutation = usePatch(
    'notifications',
    `${API_ENDPOINTS.NOTIFICATIONS}`,
    { showSuccessToast: false }
  );

  // Mark all as read mutation
  const markAllAsReadMutation = usePatch(
    'notifications',
    `${API_ENDPOINTS.NOTIFICATIONS}/read-all`,
    { showSuccessToast: false }
  );

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
      // Refetch to get updated list
      refetch();
    },
  });

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

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadMutation.mutateAsync(
        { isRead: true },
        {
          onSuccess: () => {
            // Update local state optimistically
            setNotifications(prev =>
              prev.map(n => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
            );
            toast.success("Notification marked as read");
            // Trigger event for header update
            window.dispatchEvent(new Event("customerNotificationsUpdated"));
          },
        }
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync(
        {},
        {
          onSuccess: () => {
            // Update local state
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
            // Trigger event for header update
            window.dispatchEvent(new Event("customerNotificationsUpdated"));
          },
        }
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
              Notifications
            </h1>
            <p className="text-charcoal-grey/70">
              Stay updated with your orders and offers
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={
              notifications.every((n) => n.isRead || n.read) ||
              markAllAsReadMutation.isPending ||
              isLoading
            }
            className="px-4 py-2 rounded-xl bg-charcoal-grey/5 text-charcoal-grey/70 hover:bg-charcoal-grey/10 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && Array.isArray(notifications) && (
          <div className="space-y-3">
            {notifications.map((notification) => {
              if (!notification) return null;
              const notificationId = notification._id || notification.id;
              const isRead = notification.isRead || notification.read;
              return (
                <Card
                  key={notificationId}
                  className={`p-5 ${
                    !isRead
                      ? "border-l-4 border-l-deep-maroon bg-deep-maroon/5"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0">
                      <FiBell className="w-6 h-6 text-deep-maroon" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-charcoal-grey">
                          {notification.title || notification.message?.substring(0, 50)}
                        </h3>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-deep-maroon"></span>
                        )}
                      </div>
                      <p className="text-charcoal-grey/70 mb-2">
                        {notification.message || notification.body || notification.content}
                      </p>
                      <p className="text-sm text-charcoal-grey/60">
                        {notification.date || notification.createdAt || 'Recently'}
                      </p>
                    </div>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notificationId)}
                        disabled={markAsReadMutation.isPending}
                        className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60 flex-shrink-0 transition-colors disabled:opacity-50"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">No notifications</h3>
              <p className="text-charcoal-grey/60">
                You're all caught up! New notifications will appear here
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerNotificationsPage;

