import DashboardWelcome from "../../features/admin-dashboard/components/DashboardWelcome";
import DashboardStats from "../../features/admin-dashboard/components/DashboardStats";
import DashboardQuickActions from "../../features/admin-dashboard/components/DashboardQuickActions";
import DashboardRecentOrders from "../../features/admin-dashboard/components/DashboardRecentOrders";
import Card from "../../ui/cards/Card";
import { StatsCardSkeleton, OrderCardSkeleton, Skeleton } from "../../ui/skeletons";
import { FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const userName = user?.name || "Admin";

  // Fetch admin dashboard stats
  const { data: analyticsData, isLoading: analyticsLoading } = useGet(
    'admin-dashboard-stats',
    `${API_ENDPOINTS.ADMIN}/dashboard/stats`,
    { showErrorToast: true }
  );

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useGet(
    'admin-orders',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: true }
  );

  const orders = ordersData?.data?.orders || ordersData?.data || [];
  const recentOrders = orders.slice(0, 5);

  // Get stats from analytics or calculate from data
  const stats = analyticsData?.data || {
    totalOrders: orders.length || 0,
    ordersTrend: 0,
    totalUsers: 0,
    usersTrend: 0,
    totalVendors: 0,
    vendorsTrend: 0,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || o.amount || 0), 0) || 0,
    revenueTrend: 0,
  };

  // Activity feed - fallback data if API doesn't provide activity feed
  const activityFeed = analyticsData?.data?.activityFeed || [
    { type: "order", message: "New order placed", time: "Recently", status: "success" },
    { type: "user", message: "New customer registered", time: "Recently", status: "success" },
    { type: "vendor", message: "Vendor application pending review", time: "Recently", status: "warning" },
  ];

  if (analyticsLoading || ordersLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <DashboardWelcome userName={userName} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCardSkeleton count={4} />
          </div>
          <DashboardQuickActions />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="grid gap-6">
                <OrderCardSkeleton count={5} />
              </div>
            </div>
            <Card className="p-6">
              <Skeleton variant="heading" className="mb-4 w-1/3" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-charcoal-grey/10">
                    <Skeleton variant="avatar" className="w-8 h-8" />
                    <div className="flex-1">
                      <Skeleton variant="text" className="mb-1 w-3/4" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
        <DashboardRecentOrders orders={recentOrders} />
          </div>
          
          {/* Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-charcoal-grey">Activity Feed</h2>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-charcoal-grey/10 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.status === "success" 
                        ? "bg-green-50 text-green-600" 
                        : activity.status === "warning"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {activity.status === "success" ? (
                        <FiCheckCircle className="w-4 h-4" />
                      ) : (
                        <FiAlertCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-grey">{activity.message}</p>
                      <p className="text-xs text-charcoal-grey/50 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

