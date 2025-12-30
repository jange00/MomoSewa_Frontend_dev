import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { FiBell, FiCheck, FiTrash2, FiPackage, FiUsers, FiShoppingBag } from "react-icons/fi";
import { NotificationSkeleton, Skeleton } from "../../ui/skeletons";
import toast from "react-hot-toast";
import { useGet, usePatch, useDelete } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { useSocket } from "../../hooks/useSocket";
import apiClient from "../../api/client";

const AdminNotificationsPage = () => {
  // Fetch notifications from API
  const { data: notificationsData, isLoading, refetch } = useGet(
    'admin-notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { showErrorToast: true }
  );

  const notifications = notificationsData?.data?.notifications || notificationsData?.data || [];

  // Mark as read mutation - will use dynamic endpoint with notification ID
  const markAsReadMutation = usePatch(
    'admin-notifications',
    '',
    { showSuccessToast: false }
  );

  // Mark all as read mutation
  const markAllAsReadMutation = usePatch(
    'admin-notifications',
    `${API_ENDPOINTS.NOTIFICATIONS}/read-all`,
    { showSuccessToast: false }
  );

  // Delete notification mutation
  const deleteNotificationMutation = useDelete(
    'admin-notifications',
    API_ENDPOINTS.NOTIFICATIONS,
    { showSuccessToast: false }
  );

  // Listen to real-time notifications via Socket.IO
  useSocket({
    onNotification: (data) => {
      refetch();
    },
  });

  const markAsRead = async (id) => {
    try {
      await markAsReadMutation.mutateAsync(
        { isRead: true },
        {
          onSuccess: () => {
            refetch();
          },
        }
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // According to backend: PUT /notifications/read-all
      const response = await apiClient.put(`${API_ENDPOINTS.NOTIFICATIONS}/read-all`);
      if (response.data.success) {
        refetch();
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error(error.response?.data?.message || "Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await deleteNotificationMutation.mutateAsync(id, {
        onSuccess: () => {
          refetch();
          toast.success("Notification deleted");
        },
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !(n.isRead || n.read)).length;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-charcoal-grey">Notifications</h1>
            <p className="text-charcoal-grey/70 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="primary" 
              size="md" 
              onClick={markAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <FiCheck className="w-4 h-4 mr-2" />
              {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark All as Read'}
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <FiBell className="w-16 h-16 text-charcoal-grey/30 mx-auto mb-4" />
              <p className="text-charcoal-grey/60">No notifications</p>
            </Card>
          ) : (
            notifications.map((notification) => {
              const notificationId = notification._id || notification.id;
              const isRead = notification.isRead || notification.read;
              const Icon = notification.icon || FiBell;
              return (
                <Card
                  key={notificationId}
                  className={`p-6 ${!isRead ? "bg-deep-maroon/5 border-deep-maroon/20" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-deep-maroon" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-charcoal-grey">
                            {notification.title || notification.message?.substring(0, 50)}
                          </h3>
                          <p className="text-charcoal-grey/70 mt-1">
                            {notification.message || notification.body || notification.content}
                          </p>
                          <p className="text-sm text-charcoal-grey/50 mt-2">
                            {notification.time || notification.createdAt || 'Recently'}
                          </p>
                        </div>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-deep-maroon"></span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notificationId)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <FiCheck className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notificationId)}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;

