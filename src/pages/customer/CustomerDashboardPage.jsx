import DashboardWelcome from "../../features/customer-dashboard/components/DashboardWelcome";
import DashboardStats from "../../features/customer-dashboard/components/DashboardStats";
import DashboardQuickActions from "../../features/customer-dashboard/components/DashboardQuickActions";
import DashboardRecentOrders from "../../features/customer-dashboard/components/DashboardRecentOrders";
import DashboardOffers from "../../features/customer-dashboard/components/DashboardOffers";
import { StatsCardSkeleton, OrderCardSkeleton } from "../../ui/skeletons";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const CustomerDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const userName = user?.name || "Customer";

  // Fetch orders for stats and recent orders
  const { data: ordersData, isLoading: ordersLoading } = useGet(
    'customer-orders',
    API_ENDPOINTS.ORDERS,
    { 
      showErrorToast: true,
      enabled: isAuthenticated, // Only fetch when authenticated
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  const orders = Array.isArray(ordersData?.data?.orders) ? ordersData.data.orders :
                 Array.isArray(ordersData?.data) ? ordersData.data : [];
  
  // Calculate stats from orders
  const stats = {
    totalOrders: orders.length || 0,
    activeOrders: Array.isArray(orders) ? orders.filter((o) => 
      o && ['pending', 'preparing', 'on-the-way'].includes(o.status)
    ).length : 0,
    totalSpent: Array.isArray(orders) ? orders
      .filter((o) => o && o.status === 'delivered')
      .reduce((sum, o) => sum + (o.total || o.amount || 0), 0) : 0,
  };

  // Get recent orders (last 3)
  const recentOrders = Array.isArray(orders) ? orders.slice(0, 3) : [];

  if (ordersLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardWelcome userName={userName} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCardSkeleton count={3} />
          </div>
          <DashboardQuickActions />
          <div className="grid gap-6">
            <OrderCardSkeleton count={3} />
          </div>
          <DashboardOffers />
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
        <DashboardRecentOrders orders={recentOrders} />
        <DashboardOffers />
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
