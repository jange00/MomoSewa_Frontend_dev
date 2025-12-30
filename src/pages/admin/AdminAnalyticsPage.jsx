import Card from "../../ui/cards/Card";
import { FiTrendingUp, FiUsers, FiShoppingBag, FiPackage, FiCreditCard } from "react-icons/fi";
import { AnalyticsSkeleton, Skeleton } from "../../ui/skeletons";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminAnalyticsPage = () => {
  // Fetch admin analytics from API
  // Note: If backend doesn't have /admin/analytics, use /admin/dashboard/stats
  const { data: analyticsData, isLoading } = useGet(
    'admin-analytics',
    `${API_ENDPOINTS.ADMIN}/dashboard/stats`,
    { showErrorToast: true }
  );

  const analytics = analyticsData?.data || {};
  
  // Use API data or provide defaults
  const processedAnalytics = {
    overview: {
      totalRevenue: analytics.totalRevenue || analytics.overview?.totalRevenue || 0,
      revenueGrowth: analytics.revenueGrowth || analytics.overview?.revenueGrowth || 0,
      totalOrders: analytics.totalOrders || analytics.overview?.totalOrders || 0,
      ordersGrowth: analytics.ordersGrowth || analytics.overview?.ordersGrowth || 0,
      totalUsers: analytics.totalUsers || analytics.overview?.totalUsers || 0,
      usersGrowth: analytics.usersGrowth || analytics.overview?.usersGrowth || 0,
      totalVendors: analytics.totalVendors || analytics.overview?.totalVendors || 0,
      vendorsGrowth: analytics.vendorsGrowth || analytics.overview?.vendorsGrowth || 0,
    },
    recentActivity: analytics.recentActivity || [],
  };
  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <Skeleton variant="title" className="mb-2 w-64" />
            <Skeleton variant="text" className="w-96" />
          </div>
          <AnalyticsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-charcoal-grey">Platform Analytics</h1>
          <p className="text-charcoal-grey/70 mt-1">Comprehensive insights into platform performance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-deep-maroon" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600">
                <FiTrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{processedAnalytics.overview.revenueGrowth}%</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Revenue</h3>
            <p className="text-2xl font-black text-charcoal-grey">
              Rs. {processedAnalytics.overview.totalRevenue.toLocaleString()}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-deep-maroon" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600">
                <FiTrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{processedAnalytics.overview.ordersGrowth}%</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Orders</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalOrders}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-deep-maroon" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600">
                <FiTrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{processedAnalytics.overview.usersGrowth}%</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Users</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalUsers}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-deep-maroon" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600">
                <FiTrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">{processedAnalytics.overview.vendorsGrowth}%</span>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Vendors</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalVendors}</p>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-black text-charcoal-grey mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {processedAnalytics.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-charcoal-grey/5 hover:bg-charcoal-grey/10 transition-colors"
              >
                <div>
                  <p className="font-semibold text-charcoal-grey">{activity.description}</p>
                  <p className="text-sm text-charcoal-grey/60 mt-1">{activity.time}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-charcoal-grey/10 text-charcoal-grey/70 font-medium">
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

