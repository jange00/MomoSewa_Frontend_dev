import { Link } from "react-router-dom";
import AdminOrderCard from "./AdminOrderCard";
import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";
import { FiPackage, FiSearch } from "react-icons/fi";

const OrdersGrid = ({ orders, onClearFilters }) => {
  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-deep-maroon/10 to-golden-amber/10 flex items-center justify-center mx-auto mb-6">
            <FiPackage className="w-10 h-10 text-charcoal-grey/40" />
          </div>
          <h3 className="text-xl font-bold text-charcoal-grey mb-2">No Orders Found</h3>
          <p className="text-charcoal-grey/60 mb-6">
            {onClearFilters 
              ? "No orders match your current filters. Try adjusting your search criteria or filters."
              : "There are no orders in the system yet. Orders will appear here once customers start placing them."}
          </p>
          {onClearFilters && (
            <Button variant="primary" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => {
        const orderId = order._id || order.id;
        return (
          <AdminOrderCard key={orderId} order={order} />
        );
      })}
    </div>
  );
};

export default OrdersGrid;

