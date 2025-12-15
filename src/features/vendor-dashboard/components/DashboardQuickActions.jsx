import { FiPackage, FiShoppingBag, FiBarChart2, FiSettings } from "react-icons/fi";
import QuickActionCard from "../../../ui/cards/QuickActionCard";

const DashboardQuickActions = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-charcoal-grey">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickActionCard
          icon={FiPackage}
          title="View Orders"
          description="Manage orders"
          to="/vendor/orders"
        />
        <QuickActionCard
          icon={FiShoppingBag}
          title="Manage Products"
          description="Edit menu"
          to="/vendor/products"
        />
        <QuickActionCard
          icon={FiBarChart2}
          title="Analytics"
          description="View insights"
          to="/vendor/analytics"
        />
        <QuickActionCard
          icon={FiSettings}
          title="Settings"
          description="Configure"
          to="/vendor/settings"
        />
      </div>
    </div>
  );
};

export default DashboardQuickActions;



