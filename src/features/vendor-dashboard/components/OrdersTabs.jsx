import { FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

const ORDER_TABS = [
  { id: "all", label: "All Orders", icon: FiPackage },
  { id: "pending", label: "Pending", icon: FiClock },
  { id: "preparing", label: "Preparing", icon: FiPackage },
  { id: "on-the-way", label: "On the Way", icon: FiTruck },
  { id: "delivered", label: "Delivered", icon: FiCheckCircle },
  { id: "cancelled", label: "Cancelled", icon: FiXCircle },
];

const OrdersTabs = ({ activeTab, onTabChange, ordersCount }) => {
  return (
    <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
      {ORDER_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const count =
          tab.id === "all"
            ? ordersCount.total
            : ordersCount[tab.id] || 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-gradient-to-r from-deep-maroon to-[#7a2533] text-white shadow-lg"
                : "bg-white/60 backdrop-blur-sm text-charcoal-grey/70 hover:bg-charcoal-grey/5 hover:text-deep-maroon border border-charcoal-grey/10"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-deep-maroon/10 text-deep-maroon"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OrdersTabs;




