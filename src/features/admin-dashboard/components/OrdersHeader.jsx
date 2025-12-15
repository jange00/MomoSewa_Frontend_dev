import { FiSearch } from "react-icons/fi";

const OrdersHeader = ({ title = "All Orders", searchQuery, onSearchChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
          {title}
        </h1>
        <p className="text-charcoal-grey/70">
          Manage and monitor all platform orders
        </p>
      </div>
      
      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FiSearch className="w-5 h-5 text-charcoal-grey/35" />
          </div>
          <input
            type="text"
            placeholder="Search orders by ID, customer, vendor..."
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 placeholder:text-charcoal-grey/30 text-sm font-medium"
          />
        </div>
      )}
    </div>
  );
};

export default OrdersHeader;

