import { useMemo, useState } from "react";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import { 
  FiTrendingUp, 
  FiUsers, 
  FiShoppingBag, 
  FiPackage, 
  FiCreditCard,
  FiTrendingDown,
  FiCalendar,
  FiRefreshCw
} from "react-icons/fi";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";
import { AnalyticsSkeleton } from "../../ui/skeletons";

const COLORS = ["#7a2533", "#d4af37", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

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

// Helper to get date range based on time period
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default: // 'day'
      start.setDate(now.getDate() - 1);
  }
  
  return { start, end: now };
};

const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("month");

  // Fetch admin analytics from API (if available)
  const { data: analyticsData, isLoading: analyticsLoading, refetch } = useGet(
    'admin-analytics',
    `${API_ENDPOINTS.ADMIN}/dashboard/stats`,
    { 
      showErrorToast: false,
      retry: false,
    }
  );

  // Fetch all orders
  const { data: ordersData, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useGet(
    'admin-orders-analytics',
    API_ENDPOINTS.ORDERS,
    { showErrorToast: false }
  );

  // Fetch all users
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGet(
    'admin-users-analytics',
    `${API_ENDPOINTS.ADMIN}/users`,
    { showErrorToast: false }
  );

  // Fetch all vendors
  const { data: vendorsData, isLoading: vendorsLoading, error: vendorsError, refetch: refetchVendors } = useGet(
    'admin-vendors-analytics',
    `${API_ENDPOINTS.ADMIN}/vendors`,
    { 
      showErrorToast: false,
      params: { includePending: true, status: 'all' }
    }
  );

  const isLoading = analyticsLoading || ordersLoading || usersLoading || vendorsLoading;
  const hasError = ordersError || usersError || vendorsError;

  // Refetch all data
  const handleRefresh = () => {
    refetch();
    refetchOrders();
    refetchUsers();
    refetchVendors();
  };

  // Extract data from API responses
  const orders = useMemo(() => {
    const ordersList = ordersData?.data?.orders || ordersData?.data || [];
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
    
    const pendingApps = vendorsData?.data?.applications || [];
    return [...vendorsList, ...pendingApps];
  }, [vendorsData]);

  // Calculate stats from real data (filtered by time range)
  const processedAnalytics = useMemo(() => {
    const { start } = getDateRange(timeRange);
    
    // Filter orders by time range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date || Date.now());
      return orderDate >= start;
    });

    const deliveredOrders = filteredOrders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    
    const totalRevenue = deliveredOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || 0), 
      0
    );

    // Filter users by time range
    const filteredUsers = users.filter(user => {
      const userDate = new Date(user.createdAt || user.joinDate || Date.now());
      return userDate >= start;
    });

    const customers = filteredUsers.filter(u => u.role === 'Customer' || !u.role);
    const allCustomers = users.filter(u => u.role === 'Customer' || !u.role);
    
    // Filter vendors by time range
    const filteredVendors = vendors.filter(vendor => {
      const vendorDate = new Date(vendor.createdAt || vendor.applicationDate || Date.now());
      return vendorDate >= start;
    });

    const approvedVendors = filteredVendors.filter(v => 
      v.status === 'active' || (v.role === 'Vendor' && v.status !== 'pending' && v.status !== 'rejected')
    );
    const allApprovedVendors = vendors.filter(v => 
      v.status === 'active' || (v.role === 'Vendor' && v.status !== 'pending' && v.status !== 'rejected')
    );

    // Calculate average order value
    const avgOrderValue = deliveredOrders.length > 0 
      ? totalRevenue / deliveredOrders.length 
      : 0;

    // Calculate conversion rate (orders / users)
    const conversionRate = allCustomers.length > 0 
      ? (orders.length / allCustomers.length) * 100 
      : 0;

    // Calculate growth percentages (compare current period with previous period)
    const previousStart = new Date(start);
    const previousEnd = new Date(start);
    const periodDays = (new Date() - start) / (1000 * 60 * 60 * 24);
    
    if (timeRange === 'day') {
      previousStart.setDate(previousStart.getDate() - 1);
    } else if (timeRange === 'week') {
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (timeRange === 'month') {
      previousStart.setMonth(previousStart.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      previousStart.setMonth(previousStart.getMonth() - 3);
    } else {
      previousStart.setFullYear(previousStart.getFullYear() - 1);
    }

    // Previous period data
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date || Date.now());
      return orderDate >= previousStart && orderDate < start;
    });
    const previousDeliveredOrders = previousOrders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    const previousRevenue = previousDeliveredOrders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || 0), 
      0
    );
    const previousUsers = users.filter(user => {
      const userDate = new Date(user.createdAt || user.joinDate || Date.now());
      return userDate >= previousStart && userDate < start;
    }).filter(u => u.role === 'Customer' || !u.role);
    const previousVendors = vendors.filter(vendor => {
      const vendorDate = new Date(vendor.createdAt || vendor.applicationDate || Date.now());
      return vendorDate >= previousStart && vendorDate < start;
    }).filter(v => 
      v.status === 'active' || (v.role === 'Vendor' && v.status !== 'pending' && v.status !== 'rejected')
    );

    // Calculate growth
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : (totalRevenue > 0 ? 100 : 0);
    const ordersGrowth = previousOrders.length > 0 
      ? ((filteredOrders.length - previousOrders.length) / previousOrders.length) * 100 
      : (filteredOrders.length > 0 ? 100 : 0);
    const usersGrowth = previousUsers.length > 0 
      ? ((customers.length - previousUsers.length) / previousUsers.length) * 100 
      : (customers.length > 0 ? 100 : 0);
    const vendorsGrowth = previousVendors.length > 0 
      ? ((approvedVendors.length - previousVendors.length) / previousVendors.length) * 100 
      : (approvedVendors.length > 0 ? 100 : 0);

    return {
    overview: {
        totalRevenue: analyticsData?.data?.totalRevenue ?? totalRevenue,
        revenueGrowth: analyticsData?.data?.revenueGrowth ?? analyticsData?.data?.revenueTrend ?? Math.round(revenueGrowth * 10) / 10,
        totalOrders: analyticsData?.data?.totalOrders ?? filteredOrders.length,
        ordersGrowth: analyticsData?.data?.ordersGrowth ?? analyticsData?.data?.ordersTrend ?? Math.round(ordersGrowth * 10) / 10,
        totalUsers: analyticsData?.data?.totalUsers ?? customers.length,
        usersGrowth: analyticsData?.data?.usersGrowth ?? analyticsData?.data?.usersTrend ?? Math.round(usersGrowth * 10) / 10,
        totalVendors: analyticsData?.data?.totalVendors ?? approvedVendors.length,
        vendorsGrowth: analyticsData?.data?.vendorsGrowth ?? analyticsData?.data?.vendorsTrend ?? Math.round(vendorsGrowth * 10) / 10,
        avgOrderValue,
        conversionRate,
      },
    };
  }, [analyticsData, orders, users, vendors, timeRange]);

  // Revenue and Orders trend data by date
  const revenueTrendData = useMemo(() => {
    const { start } = getDateRange(timeRange);
    const dateMap = new Map();
    
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date || Date.now());
      return orderDate >= start;
    });

    const deliveredOrders = filteredOrders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    
    deliveredOrders.forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
      let dateKey, dateStr;
      
      if (timeRange === 'day') {
        dateKey = orderDate.toISOString().split('T')[0];
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
      } else if (timeRange === 'week') {
        dateKey = orderDate.toISOString().split('T')[0];
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeRange === 'month') {
        dateKey = orderDate.toISOString().split('T')[0];
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateStr, dateKey, revenue: 0, orders: 0 });
      }
      const entry = dateMap.get(dateKey);
      entry.revenue += parseFloat(order.total) || parseFloat(order.amount) || 0;
      entry.orders += 1;
    });

    return Array.from(dateMap.values())
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(({ dateKey, ...rest }) => rest);
  }, [orders, timeRange]);

  // User growth data
  const userGrowthData = useMemo(() => {
    const { start } = getDateRange(timeRange);
    const dateMap = new Map();
    
    const customers = users.filter(u => u.role === 'Customer' || !u.role);
    
    customers.forEach(user => {
      const userDate = new Date(user.createdAt || user.joinDate || Date.now());
      if (userDate < start) return;
      
      let dateKey, dateStr;
      
      if (timeRange === 'day') {
        dateKey = userDate.toISOString().split('T')[0];
        dateStr = userDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
      } else if (timeRange === 'week') {
        dateKey = userDate.toISOString().split('T')[0];
        dateStr = userDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timeRange === 'month') {
        dateKey = userDate.toISOString().split('T')[0];
        dateStr = userDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        dateKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, '0')}`;
        dateStr = userDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateStr, dateKey, users: 0 });
      }
      dateMap.get(dateKey).users += 1;
    });

    // Calculate cumulative users
    let cumulative = 0;
    return Array.from(dateMap.values())
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map(({ dateKey, ...rest }) => {
        cumulative += rest.users;
        return { date: rest.date, users: cumulative };
      });
  }, [users, timeRange]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = {};
    orders.forEach(order => {
      if (order && order.status) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }
    });

    const statusColors = {
      'pending': COLORS[2],
      'preparing': COLORS[3],
      'on-the-way': COLORS[1],
      'delivered': COLORS[4],
      'completed': COLORS[4],
      'cancelled': COLORS[0],
    };

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
      value,
      color: statusColors[name] || COLORS[0],
    }));
  }, [orders]);

  // Revenue by vendor
  const vendorRevenueData = useMemo(() => {
    const vendorMap = new Map();
    
    const deliveredOrders = orders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    
    deliveredOrders.forEach(order => {
      const vendor = order.vendor || order.vendorId;
      const vendorName = vendor?.businessName || vendor?.name || vendor?.storeName || 'Unknown Vendor';
      const revenue = parseFloat(order.total) || parseFloat(order.amount) || 0;
      
      if (!vendorMap.has(vendorName)) {
        vendorMap.set(vendorName, { name: vendorName, revenue: 0, orders: 0 });
      }
      const entry = vendorMap.get(vendorName);
      entry.revenue += revenue;
      entry.orders += 1;
    });

    return Array.from(vendorMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 vendors
  }, [orders]);

  // Generate recent activity from real data
  const recentActivity = useMemo(() => {
    const activities = [];

    orders.slice(0, 5).forEach(order => {
      const orderId = order._id || order.id;
      const customerName = order.customer?.name || order.customerId?.name || 'Customer';
      const orderNumber = orderId ? `#${orderId.toString().substring(0, 8)}` : 'New Order';
      activities.push({
        type: "order",
        description: `New order ${orderNumber} placed by ${customerName}`,
        time: formatTimeAgo(order.createdAt || order.date),
        timestamp: new Date(order.createdAt || order.date || Date.now()),
      });
    });

    const recentUsers = users
      .filter(u => u.role === 'Customer' || !u.role)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.joinDate || 0);
        const dateB = new Date(b.createdAt || b.joinDate || 0);
        return dateB - dateA;
      })
      .slice(0, 3);
    
    recentUsers.forEach(user => {
      activities.push({
        type: "user",
        description: `New customer ${user.name || user.email} registered`,
        time: formatTimeAgo(user.createdAt || user.joinDate),
        timestamp: new Date(user.createdAt || user.joinDate || Date.now()),
      });
    });

    const pendingVendors = vendors.filter(v => 
      v.status === 'pending' || (v.role === 'Customer' && (v.businessName || v.storeName))
    ).slice(0, 3);
    
    pendingVendors.forEach(vendor => {
      const vendorName = vendor.businessName || vendor.name || vendor.email;
      activities.push({
        type: "vendor",
        description: `Vendor application from ${vendorName} pending review`,
        time: formatTimeAgo(vendor.createdAt || vendor.applicationDate),
        timestamp: new Date(vendor.createdAt || vendor.applicationDate || Date.now()),
      });
    });

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(({ timestamp, ...rest }) => rest);
  }, [orders, users, vendors]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <AnalyticsSkeleton />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-charcoal-grey mb-2">Error Loading Analytics</h2>
            <p className="text-charcoal-grey/70 mb-4">
              Failed to load analytics data. Please check your connection and try again.
            </p>
            <Button variant="primary" onClick={handleRefresh}>
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
          <h1 className="text-3xl font-black text-charcoal-grey">Platform Analytics</h1>
          <p className="text-charcoal-grey/70 mt-1">Comprehensive insights into platform performance</p>
        </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <FiCalendar className="w-5 h-5 text-charcoal-grey/60" />
            <span className="text-sm font-semibold text-charcoal-grey">Time Range:</span>
            {['day', 'week', 'month', 'quarter', 'year'].map((period) => (
              <Button
                key={period}
                variant={timeRange === period ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTimeRange(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiCreditCard className="w-6 h-6 text-deep-maroon" />
              </div>
              {processedAnalytics.overview.revenueGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  processedAnalytics.overview.revenueGrowth > 0 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {processedAnalytics.overview.revenueGrowth > 0 ? (
                <FiTrendingUp className="w-4 h-4" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">{Math.abs(processedAnalytics.overview.revenueGrowth)}%</span>
              </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Revenue</h3>
            <p className="text-2xl font-black text-charcoal-grey">
              Rs. {processedAnalytics.overview.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-charcoal-grey/50 mt-1">
              Avg: Rs. {processedAnalytics.overview.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-deep-maroon" />
              </div>
              {processedAnalytics.overview.ordersGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  processedAnalytics.overview.ordersGrowth > 0 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {processedAnalytics.overview.ordersGrowth > 0 ? (
                <FiTrendingUp className="w-4 h-4" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">{Math.abs(processedAnalytics.overview.ordersGrowth)}%</span>
              </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Orders</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalOrders}</p>
            <p className="text-xs text-charcoal-grey/50 mt-1">
              Conversion: {processedAnalytics.overview.conversionRate.toFixed(1)}%
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-deep-maroon" />
              </div>
              {processedAnalytics.overview.usersGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  processedAnalytics.overview.usersGrowth > 0 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {processedAnalytics.overview.usersGrowth > 0 ? (
                <FiTrendingUp className="w-4 h-4" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">{Math.abs(processedAnalytics.overview.usersGrowth)}%</span>
              </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Users</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalUsers}</p>
            <p className="text-xs text-charcoal-grey/50 mt-1">
              Active customers
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-deep-maroon" />
              </div>
              {processedAnalytics.overview.vendorsGrowth !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                  processedAnalytics.overview.vendorsGrowth > 0 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  {processedAnalytics.overview.vendorsGrowth > 0 ? (
                <FiTrendingUp className="w-4 h-4" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">{Math.abs(processedAnalytics.overview.vendorsGrowth)}%</span>
              </div>
              )}
            </div>
            <h3 className="text-sm font-semibold text-charcoal-grey/60 mb-1">Total Vendors</h3>
            <p className="text-2xl font-black text-charcoal-grey">{processedAnalytics.overview.totalVendors}</p>
            <p className="text-xs text-charcoal-grey/50 mt-1">
              Active vendors
            </p>
          </Card>
        </div>

        {/* Charts Row 1: Revenue & Orders Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-black text-charcoal-grey mb-6">Revenue & Orders Trend</h2>
            {revenueTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a2533" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7a2533" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return [`Rs. ${value.toLocaleString()}`, "Revenue"];
                    }
                    return [value, "Orders"];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7a2533"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#d4af37"
                  strokeWidth={2}
                  dot={{ fill: "#d4af37", r: 3 }}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-charcoal-grey/60">
                <div className="text-center">
                  <FiTrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No revenue data for selected period</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-black text-charcoal-grey mb-6">User Growth</h2>
            {userGrowthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Total Users"
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-charcoal-grey/60">
                <div className="text-center">
                  <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No user growth data for selected period</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Charts Row 2: Order Status & Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-black text-charcoal-grey mb-6">Order Status Distribution</h2>
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-charcoal-grey/60">
                <div className="text-center">
                  <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No order data available</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-black text-charcoal-grey mb-6">Top Vendors by Revenue</h2>
            {vendorRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendorRevenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  type="category"
                  dataKey="name" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  formatter={(value) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#7a2533" name="Revenue" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-charcoal-grey/60">
                <div className="text-center">
                  <FiShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No vendor revenue data available</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-black text-charcoal-grey mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
          <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const getActivityConfig = (type) => {
                  switch (type) {
                    case 'order':
                      return {
                        icon: FiPackage,
                        color: 'text-deep-maroon',
                        bgColor: 'bg-deep-maroon/10',
                        label: 'Order'
                      };
                    case 'user':
                      return {
                        icon: FiUsers,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50',
                        label: 'User'
                      };
                    case 'vendor':
                      return {
                        icon: FiShoppingBag,
                        color: 'text-golden-amber',
                        bgColor: 'bg-golden-amber/10',
                        label: 'Vendor'
                      };
                    default:
                      return {
                        icon: FiTrendingUp,
                        color: 'text-charcoal-grey',
                        bgColor: 'bg-charcoal-grey/10',
                        label: 'Activity'
                      };
                  }
                };

                const config = getActivityConfig(activity.type);
                const Icon = config.icon;

                return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-charcoal-grey/5 hover:bg-charcoal-grey/10 transition-colors"
              >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                  <p className="font-semibold text-charcoal-grey">{activity.description}</p>
                  <p className="text-sm text-charcoal-grey/60 mt-1">{activity.time}</p>
                </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-lg ${config.bgColor} ${config.color} font-medium flex-shrink-0`}>
                      {config.label}
                </span>
              </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiTrendingUp className="w-16 h-16 text-charcoal-grey/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">No Recent Activity</h3>
              <p className="text-charcoal-grey/60">
                Activity will appear here as orders, users, and vendors are added to the platform.
              </p>
          </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
