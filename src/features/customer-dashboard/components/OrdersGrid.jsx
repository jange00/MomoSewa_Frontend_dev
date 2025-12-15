import { Link } from "react-router-dom";
import RecentOrderCard from "../../../ui/cards/RecentOrderCard";
import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";
import EmptyState from "../../../ui/empty/EmptyState";

const OrdersGrid = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <Card className="p-12">
        <EmptyState onClearFilters={() => {}} />
        <div className="text-center mt-6">
          <p className="text-charcoal-grey/60 mb-4">No orders found in this category</p>
          <Link to="/menu">
            <Button variant="primary" size="md">
              Order Now
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order) => (
        <RecentOrderCard key={order.id} order={order} />
      ))}
    </div>
  );
};

export default OrdersGrid;

