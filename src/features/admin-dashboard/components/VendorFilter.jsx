import { FiShoppingBag, FiX } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";

const VendorFilter = ({ vendors, selectedVendor, onVendorChange, onClear }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShoppingBag className="w-5 h-5 text-charcoal-grey/60" />
          <h3 className="font-semibold text-charcoal-grey">Filter by Vendor</h3>
        </div>
        {selectedVendor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-charcoal-grey/60 hover:text-charcoal-grey"
          >
            <FiX className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedVendor === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => onVendorChange("all")}
        >
          All Vendors
        </Button>
        {vendors.map((vendor) => (
          <Button
            key={vendor.id}
            variant={selectedVendor === vendor.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => onVendorChange(vendor.id)}
            className="flex items-center gap-2"
          >
            <span>{vendor.businessName || vendor.name}</span>
            {vendor.orderCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-deep-maroon/10 text-deep-maroon text-xs font-bold">
                {vendor.orderCount}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default VendorFilter;

