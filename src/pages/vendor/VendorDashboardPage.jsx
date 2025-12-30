import DashboardWelcome from "../../features/vendor-dashboard/components/DashboardWelcome";
import DashboardStats from "../../features/vendor-dashboard/components/DashboardStats";
import DashboardQuickActions from "../../features/vendor-dashboard/components/DashboardQuickActions";
import DashboardRecentOrders from "../../features/vendor-dashboard/components/DashboardRecentOrders";
import { StatsCardSkeleton, OrderCardSkeleton } from "../../ui/skeletons";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { vendorService } from "../../services";
import apiClient from "../../api/client";
import toast from "react-hot-toast";

const VendorDashboardPage = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.businessName || "Vendor";

  // Fetch vendor orders (vendors get their orders from /orders endpoint, filtered by auth)
  // Note: /vendors/analytics and /vendors/orders don't exist in backend - use /orders instead
  const { data: ordersData, isLoading: ordersLoading, refetch } = useGet(
    'vendor-orders',
    API_ENDPOINTS.ORDERS,
    { 
      showErrorToast: false, // Don't show error toast, handle gracefully
      retry: 1,
    }
  );

  const orders = Array.isArray(ordersData?.data?.orders) ? ordersData.data.orders :
                 Array.isArray(ordersData?.data) ? ordersData.data : [];
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

  // Calculate stats from orders (no separate analytics endpoint available)
  const stats = {
    totalOrders: orders.length || 0,
    activeOrders: Array.isArray(orders) ? orders.filter(o => 
      o && ['pending', 'preparing', 'on-the-way'].includes(o.status)
    ).length : 0,
    totalRevenue: Array.isArray(orders) ? orders.filter(o => 
      o && o.status === 'delivered'
    ).reduce((sum, o) => sum + (o.total || o.amount || 0), 0) : 0,
    todayRevenue: 0,
    ordersTrend: 0,
    revenueTrend: 0,
    todayTrend: 0,
  };

  // Handle order status updates
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // According to backend: PUT /orders/:id/status
      const response = await apiClient.put(
        `${API_ENDPOINTS.ORDERS}/${orderId}/status`,
        { status: newStatus }
      );
      
      if (response.data.success) {
        toast.success(response.data.message || "Order status updated successfully");
        refetch();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
    }
  };

  if (ordersLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardWelcome userName={userName} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCardSkeleton count={4} />
          </div>
          <DashboardQuickActions />
          <div className="grid gap-6">
            <OrderCardSkeleton count={5} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardWelcome userName={userName} />
        <DashboardStats stats={stats} />
        <DashboardQuickActions />
        <DashboardRecentOrders orders={recentOrders} onStatusUpdate={handleStatusUpdate} />
      </div>
    </div>
  );
};

export default VendorDashboardPage;

