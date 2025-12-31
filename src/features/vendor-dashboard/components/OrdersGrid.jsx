import VendorOrderCard from "./VendorOrderCard";
import Card from "../../../ui/cards/Card";
import EmptyState from "../../../ui/empty/EmptyState";

const OrdersGrid = ({ orders, onStatusUpdate }) => {
  if (orders.length === 0) {
    return (
      <Card className="p-12">
        <EmptyState onClearFilters={() => {}} />
        <div className="text-center mt-6">
          <p className="text-charcoal-grey/60 mb-4">No orders found in this category</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {orders.map((order, index) => (
        <VendorOrderCard 
          key={order._id || order.id || `order-${index}`} 
          order={order} 
          onStatusUpdate={onStatusUpdate} 
        />
      ))}
    </div>
  );
};

export default OrdersGrid;
