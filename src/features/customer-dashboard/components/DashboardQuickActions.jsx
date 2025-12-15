import { FiShoppingBag, FiPackage, FiMapPin } from "react-icons/fi";
import QuickActionCard from "../../../ui/cards/QuickActionCard";

const DashboardQuickActions = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-charcoal-grey">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <QuickActionCard
          icon={FiShoppingBag}
          title="Order Now"
          description="Browse menu"
          to="/menu"
        />
        <QuickActionCard
          icon={FiPackage}
          title="Track Order"
          description="View active orders"
          to="/customer/orders"
        />
        <QuickActionCard
          icon={FiMapPin}
          title="Addresses"
          description="Manage addresses"
          to="/customer/addresses"
        />
      </div>
    </div>
  );
};

export default DashboardQuickActions;

