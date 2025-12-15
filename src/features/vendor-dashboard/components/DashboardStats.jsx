import { FiPackage, FiTrendingUp, FiShoppingBag, FiBarChart2 } from "react-icons/fi";
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
        title="Active Orders"
        value={stats.activeOrders}
        icon={FiShoppingBag}
      />
      <StatCard
        title="Total Revenue"
        value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
        trend={stats.revenueTrend}
        icon={FiBarChart2}
      />
      <StatCard
        title="Today's Revenue"
        value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
        trend={stats.todayTrend}
        icon={FiTrendingUp}
      />
    </div>
  );
};

export default DashboardStats;

