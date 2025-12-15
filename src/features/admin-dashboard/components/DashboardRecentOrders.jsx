import { Link } from "react-router-dom";
import AdminOrderCard from "./AdminOrderCard";
import Button from "../../../ui/buttons/Button";
import { FiPackage, FiArrowRight, FiTrendingUp } from "react-icons/fi";
import Card from "../../../ui/cards/Card";

const DashboardRecentOrders = ({ orders }) => {
  // Calculate quick stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeOrders = orders.filter(order => 
    order.status !== "delivered" && order.status !== "cancelled"
  ).length;

  return (
    <div>
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-deep-maroon" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-charcoal-grey">Recent Orders</h2>
              <p className="text-sm text-charcoal-grey/60">Latest platform activity</p>
            </div>
          </div>
          <Link to="/admin/orders">
            <Button variant="secondary" size="sm" className="group">
              <span>View All</span>
              <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-gradient-to-br from-deep-maroon/5 to-transparent border-deep-maroon/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-charcoal-grey/60 mb-1">Active Orders</p>
                <p className="text-xl font-black text-deep-maroon">{activeOrders}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-deep-maroon/10 flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-deep-maroon" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-golden-amber/5 to-transparent border-golden-amber/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-charcoal-grey/60 mb-1">Total Revenue</p>
                <p className="text-xl font-black text-golden-amber">Rs. {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-golden-amber/10 flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-golden-amber" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <AdminOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default DashboardRecentOrders;

