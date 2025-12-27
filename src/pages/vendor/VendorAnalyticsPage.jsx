import { useState } from "react";
import { FiTrendingUp, FiBarChart2, FiPackage, FiUsers } from "react-icons/fi";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "../../ui/cards/Card";
import StatCard from "../../ui/cards/StatCard";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const COLORS = ["#7a2533", "#d4af37", "#3b82f6", "#10b981", "#f59e0b"];

const VendorAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Fetch vendor analytics from API
  // Note: Backend route /vendors/analytics doesn't exist (it conflicts with /vendors/:id)
  // Disabling API call and using empty/default data until backend fixes routing
  const { data: analyticsData, isLoading } = useGet(
    'vendor-analytics',
    `${API_ENDPOINTS.VENDORS}/analytics`,
    { 
      showErrorToast: false, // Disable error toast to prevent annoying errors
      enabled: false, // Disable the API call completely
      params: { timeRange }
    }
  );

  // Use empty data since the endpoint doesn't work (backend routing issue)
  const analytics = {};
  
  // Use API data or provide defaults
  const analyticsStats = {
    totalRevenue: analytics.totalRevenue || 0,
    totalOrders: analytics.totalOrders || 0,
    totalCustomers: analytics.totalCustomers || 0,
    averageOrderValue: analytics.averageOrderValue || 0,
    revenueTrend: analytics.revenueTrend || 0,
    ordersTrend: analytics.ordersTrend || 0,
    customersTrend: analytics.customersTrend || 0,
    avgOrderTrend: analytics.avgOrderTrend || 0,
  };

  // Revenue data from API or empty
  const revenueData = analytics.revenueData || analytics.chartData?.revenue || [];

  // Order status distribution from API or empty
  const orderStatusData = analytics.orderStatusData || analytics.chartData?.orderStatus || [];

  // Top products performance from API or empty
  const productPerformanceData = analytics.productPerformanceData || analytics.chartData?.products || [];

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
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
            Analytics & Insights
          </h1>
          <p className="text-charcoal-grey/70">
            Track your sales, revenue, and customer insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`Rs. ${analyticsStats.totalRevenue.toLocaleString()}`}
            trend={analyticsStats.revenueTrend}
            icon={FiBarChart2}
          />
          <StatCard
            title="Total Orders"
            value={analyticsStats.totalOrders}
            trend={analyticsStats.ordersTrend}
            icon={FiPackage}
          />
          <StatCard
            title="Total Customers"
            value={analyticsStats.totalCustomers}
            trend={analyticsStats.customersTrend}
            icon={FiUsers}
          />
          <StatCard
            title="Avg. Order Value"
            value={`Rs. ${analyticsStats.averageOrderValue.toLocaleString()}`}
            trend={analyticsStats.avgOrderTrend}
            icon={FiTrendingUp}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-charcoal-grey">
                Revenue Overview
              </h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-charcoal-grey/15 text-sm font-medium text-charcoal-grey bg-white focus:outline-none focus:ring-2 focus:ring-golden-amber/25"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7a2533"
                  strokeWidth={3}
                  dot={{ fill: "#7a2533", r: 4 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#d4af37"
                  strokeWidth={2}
                  dot={{ fill: "#d4af37", r: 4 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-charcoal-grey mb-6">
              Order Status Distribution
            </h2>
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
          </Card>
        </div>

        {/* Product Performance */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal-grey mb-6">
            Top Products Performance
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={80}
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
                formatter={(value, name) => {
                  if (name === "revenue") {
                    return [`Rs. ${value.toLocaleString()}`, "Revenue"];
                  }
                  return [value, "Orders"];
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#7a2533" name="Orders" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#d4af37" name="Revenue (Rs.)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalyticsPage;

