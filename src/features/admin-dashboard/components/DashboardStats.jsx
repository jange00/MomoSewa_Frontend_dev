import { FiPackage, FiUsers, FiShoppingBag, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import StatCard from "../../../ui/cards/StatCard";

const DashboardStats = ({ stats = {} }) => {
  // Ensure all stats have default values to prevent undefined errors
  const safeStats = {
    totalOrders: stats.totalOrders || 0,
    ordersTrend: stats.ordersTrend || 0,
    totalUsers: stats.totalUsers || 0,
    usersTrend: stats.usersTrend || 0,
    totalVendors: stats.totalVendors || 0,
    vendorsTrend: stats.vendorsTrend || 0,
    totalRevenue: stats.totalRevenue || 0,
    revenueTrend: stats.revenueTrend || 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Orders"
        value={safeStats.totalOrders}
        trend={safeStats.ordersTrend}
        icon={FiPackage}
      />
      <StatCard
        title="Total Users"
        value={safeStats.totalUsers}
        trend={safeStats.usersTrend}
        icon={FiUsers}
      />
      <StatCard
        title="Total Vendors"
        value={safeStats.totalVendors}
        trend={safeStats.vendorsTrend}
        icon={FiShoppingBag}
      />
      <StatCard
        title="Platform Revenue"
        value={`Rs. ${safeStats.totalRevenue.toLocaleString()}`}
        trend={safeStats.revenueTrend}
        icon={FiTrendingUp}
      />
    </div>
  );
};

export default DashboardStats;

