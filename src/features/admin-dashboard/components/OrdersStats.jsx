import Card from "../../../ui/cards/Card";

const OrdersStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Total Orders</p>
        <p className="text-2xl font-black text-charcoal-grey">{stats?.total || 0}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Pending</p>
        <p className="text-2xl font-black text-yellow-600">{stats?.pending || 0}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Preparing</p>
        <p className="text-2xl font-black text-blue-600">{stats?.preparing || 0}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">On the Way</p>
        <p className="text-2xl font-black text-purple-600">{stats?.onTheWay || 0}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Delivered</p>
        <p className="text-2xl font-black text-green-600">{stats?.delivered || 0}</p>
      </Card>
      <Card className="p-4 text-center">
        <p className="text-sm text-charcoal-grey/60 mb-1">Cancelled</p>
        <p className="text-2xl font-black text-red-600">{stats?.cancelled || 0}</p>
      </Card>
    </div>
  );
};

export default OrdersStats;

