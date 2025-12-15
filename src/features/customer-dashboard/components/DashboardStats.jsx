import { FiPackage, FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import StatCard from "../../../ui/cards/StatCard";

const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        trend={12}
        icon={FiPackage}
      />
      <StatCard
        title="Active Orders"
        value={stats.activeOrders}
        icon={FiShoppingBag}
      />
      <StatCard
        title="Total Spent"
        value={`Rs. ${stats.totalSpent.toLocaleString()}`}
        trend={8}
        icon={FiTrendingUp}
      />
    </div>
  );
};

export default DashboardStats;

