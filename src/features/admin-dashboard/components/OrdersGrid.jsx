import { Link } from "react-router-dom";
import AdminOrderCard from "./AdminOrderCard";
import Card from "../../../ui/cards/Card";
import EmptyState from "../../../ui/empty/EmptyState";

const OrdersGrid = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <Card className="p-12">
        <EmptyState onClearFilters={() => {}} />
        <div className="text-center mt-6">
          <p className="text-charcoal-grey/60">No orders found matching your criteria</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <AdminOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrdersGrid;

