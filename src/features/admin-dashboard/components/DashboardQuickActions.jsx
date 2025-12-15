import { FiPackage, FiUsers, FiShoppingBag, FiBarChart2, FiSettings, FiShield } from "react-icons/fi";
import QuickActionCard from "../../../ui/cards/QuickActionCard";

const DashboardQuickActions = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-charcoal-grey">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <QuickActionCard
          icon={FiPackage}
          title="View Orders"
          description="All orders"
          to="/admin/orders"
        />
        <QuickActionCard
          icon={FiUsers}
          title="Manage Users"
          description="User management"
          to="/admin/users"
        />
        <QuickActionCard
          icon={FiShoppingBag}
          title="Manage Vendors"
          description="Vendor management"
          to="/admin/vendors"
        />
        <QuickActionCard
          icon={FiBarChart2}
          title="Analytics"
          description="View insights"
          to="/admin/analytics"
        />
        <QuickActionCard
          icon={FiSettings}
          title="Settings"
          description="Configure"
          to="/admin/settings"
        />
        <QuickActionCard
          icon={FiShield}
          title="Security"
          description="Platform security"
          to="/admin/settings"
        />
      </div>
    </div>
  );
};

export default DashboardQuickActions;

