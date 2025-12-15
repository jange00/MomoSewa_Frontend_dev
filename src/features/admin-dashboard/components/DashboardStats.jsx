import { FiPackage, FiUsers, FiShoppingBag, FiTrendingUp, FiDollarSign } from "react-icons/fi";
import StatCard from "../../../ui/cards/StatCard";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        trend={stats.ordersTrend}
        icon={FiPackage}
      />
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        trend={stats.usersTrend}
        icon={FiUsers}
      />
      <StatCard
        title="Total Vendors"
        value={stats.totalVendors}
        trend={stats.vendorsTrend}
        icon={FiShoppingBag}
      />
      <StatCard
        title="Platform Revenue"
        value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
        trend={stats.revenueTrend}
        icon={FiTrendingUp}
      />
    </div>
  );
};

export default DashboardStats;

