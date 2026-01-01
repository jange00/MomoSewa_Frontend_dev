import { useMemo } from "react";
import DashboardWelcome from "../../features/admin-dashboard/components/DashboardWelcome";
import DashboardStats from "../../features/admin-dashboard/components/DashboardStats";
import DashboardQuickActions from "../../features/admin-dashboard/components/DashboardQuickActions";
import DashboardRecentOrders from "../../features/admin-dashboard/components/DashboardRecentOrders";
import Card from "../../ui/cards/Card";
import { FiTrendingUp, FiActivity, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

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
    
    return date.toLocaleDateString();
  } catch (error) {
    return "Recently";
  }
};

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const userName = user?.name || "Admin";

  // Fetch admin dashboard stats (if available)
  const { data: analyticsData, isLoading: analyticsLoading } = useGet(
    'admin-dashboard-stats',
    `${API_ENDPOINTS.ADMIN}/dashboard/stats`,
    { 
      showErrorToast: false, // Don't show error if endpoint doesn't exist
      retry: false,
    }
  );

  // Fetch all orders
  const { data: ordersData, isLoading: ordersLoading } = useGet(
    'admin-orders',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: true }
  );

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useGet(
    'admin-users',
    `${API_ENDPOINTS.ADMIN}/users`,
    { showErrorToast: false }
  );

  // Fetch all vendors
  const { data: vendorsData, isLoading: vendorsLoading } = useGet(
    'admin-vendors',
    `${API_ENDPOINTS.ADMIN}/vendors`,
    { 
      showErrorToast: false,
      params: { includePending: true, status: 'all' }
    }
  );

  // Extract data from API responses
  const orders = useMemo(() => {
    const ordersList = ordersData?.data?.orders || ordersData?.data || [];
    // Sort by date (most recent first)
    return ordersList.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
  }, [ordersData]);

  const users = useMemo(() => {
    return usersData?.data?.users || usersData?.data || [];
  }, [usersData]);

  const vendors = useMemo(() => {
    const vendorsList = vendorsData?.data?.vendors || 
                       vendorsData?.data?.vendor || 
                       (Array.isArray(vendorsData?.data) ? vendorsData.data : []);
    
    // Also check for pending applications
    const pendingApps = vendorsData?.data?.applications || [];
    return [...vendorsList, ...pendingApps];
  }, [vendorsData]);

  // Get recent orders (top 5)
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    // Use analytics data if available, otherwise calculate from fetched data
    if (analyticsData?.data) {
      return {
        totalOrders: analyticsData.data.totalOrders ?? orders.length,
        ordersTrend: analyticsData.data.ordersTrend ?? 0,
        totalUsers: analyticsData.data.totalUsers ?? users.length,
        usersTrend: analyticsData.data.usersTrend ?? 0,
        totalVendors: analyticsData.data.totalVendors ?? vendors.length,
        vendorsTrend: analyticsData.data.vendorsTrend ?? 0,
        totalRevenue: analyticsData.data.totalRevenue ?? 
          orders
            .filter(o => o.status === 'delivered' || o.status === 'completed')
            .reduce((sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || 0), 0),
        revenueTrend: analyticsData.data.revenueTrend ?? 0,
      };
    }

    // Calculate from fetched data
    const deliveredOrders = orders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    
    const totalRevenue = deliveredOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || 0), 
      0
    );

    const customers = users.filter(u => u.role === 'Customer' || !u.role);
    const approvedVendors = vendors.filter(v => 
      v.status === 'active' || (v.role === 'Vendor' && v.status !== 'pending' && v.status !== 'rejected')
    );

    return {
      totalOrders: orders.length,
      ordersTrend: 0, // Could calculate by comparing with previous period
      totalUsers: customers.length,
      usersTrend: 0,
      totalVendors: approvedVendors.length,
      vendorsTrend: 0,
      totalRevenue: totalRevenue,
      revenueTrend: 0,
    };
  }, [analyticsData, orders, users, vendors]);

  // Generate activity feed from real data
  const activityFeed = useMemo(() => {
    const activities = [];

    // Add recent orders (last 3)
    orders.slice(0, 3).forEach(order => {
      const orderId = order._id || order.id;
      const customerName = order.customer?.name || order.customerId?.name || 'Customer';
      activities.push({
        type: "order",
        message: `New order #${orderId?.substring(0, 8)} placed by ${customerName}`,
        time: formatTimeAgo(order.createdAt || order.date),
        status: "success",
        timestamp: new Date(order.createdAt || order.date || Date.now()),
      });
    });

    // Add recent users (last 2)
    const recentUsers = users
      .filter(u => u.role === 'Customer' || !u.role)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.joinDate || 0);
        const dateB = new Date(b.createdAt || b.joinDate || 0);
        return dateB - dateA;
      })
      .slice(0, 2);
    
    recentUsers.forEach(user => {
      activities.push({
        type: "user",
        message: `New customer ${user.name || user.email} registered`,
        time: formatTimeAgo(user.createdAt || user.joinDate),
        status: "success",
        timestamp: new Date(user.createdAt || user.joinDate || Date.now()),
      });
    });

    // Add pending vendors (if any)
    const pendingVendors = vendors.filter(v => 
      v.status === 'pending' || (v.role === 'Customer' && (v.businessName || v.storeName))
    ).slice(0, 2);
    
    pendingVendors.forEach(vendor => {
      const vendorName = vendor.businessName || vendor.name || vendor.email;
      activities.push({
        type: "vendor",
        message: `Vendor application from ${vendorName} pending review`,
        time: formatTimeAgo(vendor.createdAt || vendor.applicationDate),
        status: "warning",
        timestamp: new Date(vendor.createdAt || vendor.applicationDate || Date.now()),
      });
    });

    // Sort by timestamp (most recent first) and limit to 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(({ timestamp, ...rest }) => rest); // Remove timestamp from final output
  }, [orders, users, vendors]);

  // Show loading state
  const isLoading = analyticsLoading || ordersLoading || usersLoading || vendorsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon mx-auto mb-4"></div>
          <p className="text-charcoal-grey/70">Loading dashboard...</p>
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
              {activityFeed.length > 0 ? (
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
              ) : (
                <div className="text-center py-8">
                  <FiActivity className="w-12 h-12 text-charcoal-grey/30 mx-auto mb-3" />
                  <p className="text-charcoal-grey/60">No recent activity</p>
                  <p className="text-xs text-charcoal-grey/50 mt-1">Activity will appear here as it happens</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

