import Card from "../../../ui/cards/Card";

const OrdersStats = ({ orders }) => {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "on-the-way"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Total Orders</p>
        <p className="text-2xl font-black text-charcoal-grey">{totalOrders}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Active Orders</p>
        <p className="text-2xl font-black text-deep-maroon">{activeOrders}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Completed Orders</p>
        <p className="text-2xl font-black text-green-600">{completedOrders}</p>
      </Card>
    </div>
  );
};

export default OrdersStats;




