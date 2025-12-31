import { useState, useEffect } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Badge from "../../ui/badges/Badge";
import { NotificationSkeleton } from "../../ui/skeletons";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";
import { markAsRead, markAllAsRead } from "../../services/notificationService";
import { useQueryClient } from "@tanstack/react-query";

const CustomerNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
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

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      // Add new notification to the list
      setNotifications(prev => [data, ...prev]);
      // Refetch to get updated list
      refetch();
      // Invalidate unread count query
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
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

  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) {
      console.error("Notification ID not found");
      return;
    }

    setIsMarkingRead(true);
    try {
      await markAsRead(notificationId);
      // Update local state optimistically
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId || n.id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
      // Invalidate queries to refetch unread count
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Trigger event for header update
      window.dispatchEvent(new Event("customerNotificationsUpdated"));
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
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Trigger event for header update
      window.dispatchEvent(new Event("customerNotificationsUpdated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error(error.message || "Failed to mark all notifications as read");
    } finally {
      setMarkingAllRead(false);
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
              markingAllRead ||
              isLoading
            }
            className="px-4 py-2 rounded-xl bg-charcoal-grey/5 text-charcoal-grey/70 hover:bg-charcoal-grey/10 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingAllRead ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-3">
            <NotificationSkeleton count={5} />
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
                        disabled={isMarkingRead}
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

