import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";
import { FiClock, FiUser, FiShoppingBag, FiArrowRight, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminOrderCard = ({ order }) => {
  const statusColors = {
    pending: { 
      bg: "bg-yellow-50", 
      text: "text-yellow-700", 
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      gradient: "from-yellow-400/10 to-yellow-600/5",
      leftBorder: "border-l-yellow-500"
    },
    preparing: { 
      bg: "bg-blue-50", 
      text: "text-blue-700", 
      border: "border-blue-200",
      dot: "bg-blue-500",
      gradient: "from-blue-400/10 to-blue-600/5",
      leftBorder: "border-l-blue-500"
    },
    "on-the-way": { 
      bg: "bg-purple-50", 
      text: "text-purple-700", 
      border: "border-purple-200",
      dot: "bg-purple-500",
      gradient: "from-purple-400/10 to-purple-600/5",
      leftBorder: "border-l-purple-500"
    },
    delivered: { 
      bg: "bg-green-50", 
      text: "text-green-700", 
      border: "border-green-200",
      dot: "bg-green-500",
      gradient: "from-green-400/10 to-green-600/5",
      leftBorder: "border-l-green-500"
    },
    cancelled: { 
      bg: "bg-red-50", 
      text: "text-red-700", 
      border: "border-red-200",
      dot: "bg-red-500",
      gradient: "from-red-400/10 to-red-600/5",
      leftBorder: "border-l-red-500"
    },
  };

  const statusLabels = {
    pending: "Pending",
    preparing: "Preparing",
    "on-the-way": "On the Way",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const status = statusColors[order.status] || statusColors.pending;
  const statusLabel = statusLabels[order.status] || order.status;

  return (
    <Card className={`p-6 hover:shadow-xl transition-all duration-300 group border-l-4 ${status.leftBorder}`}>
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${status.gradient} flex items-center justify-center`}>
              <FiPackage className={`w-5 h-5 ${status.text}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-charcoal-grey text-lg mb-1">Order #{order.orderId || order._id || order.id}</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text} ${status.border} border`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-charcoal-grey/60 flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              <span>{order.date}</span>
            </p>
            
            {/* Customer Info */}
            {order.customer && (
              <div className="flex items-center gap-2 text-sm text-charcoal-grey/80 bg-charcoal-grey/5 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-deep-maroon/20 to-golden-amber/20 flex items-center justify-center">
                  <FiUser className="w-3.5 h-3.5 text-deep-maroon" />
                </div>
                <span className="font-semibold">{order.customer.name}</span>
              </div>
            )}
            
            {/* Vendor Info */}
            {order.vendor && (
              <div className="flex items-center gap-2 text-sm text-charcoal-grey/80 bg-charcoal-grey/5 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-golden-amber/20 to-deep-maroon/20 flex items-center justify-center">
                  <FiShoppingBag className="w-3.5 h-3.5 text-golden-amber" />
                </div>
                <span className="font-semibold truncate">{order.vendor.name || order.vendor.businessName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-br from-charcoal-grey/5 to-transparent rounded-xl border border-charcoal-grey/10">
          <div className="space-y-2.5">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-xl shadow-sm">
                  {item.emoji || "🥟"}
                </div>
                <span className="flex-1 text-charcoal-grey/90 font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-charcoal-grey/70 font-semibold">Rs. {item.price}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="pt-2 border-t border-charcoal-grey/10">
                <p className="text-xs text-charcoal-grey/60 text-center font-medium">
                  +{order.items.length - 2} more items
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with Total and Action */}
      <div className="pt-4 border-t border-charcoal-grey/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-charcoal-grey/60 mb-1">Total Amount</p>
            <p className="font-black text-deep-maroon text-xl">Rs. {order.total.toFixed(2)}</p>
          </div>
          {order.itemsCount && (
            <div className="text-right">
              <p className="text-xs text-charcoal-grey/60 mb-1">Items</p>
              <p className="font-bold text-charcoal-grey">{order.itemsCount}</p>
            </div>
          )}
        </div>
        <Link to={`/admin/orders/${order._id || order.id}`}>
          <Button variant="secondary" size="sm" className="w-full group-hover:bg-deep-maroon group-hover:text-white transition-colors">
            <span>View Details</span>
            <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default AdminOrderCard;

