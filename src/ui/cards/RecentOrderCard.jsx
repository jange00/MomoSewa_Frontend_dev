import Card from "./Card";
import Button from "../buttons/Button";
import { FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

const RecentOrderCard = ({ order, basePath = "/customer/orders" }) => {
  const statusColors = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    preparing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "on-the-way": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
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
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-charcoal-grey">Order #{order.id}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-charcoal-grey/60 flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            {order.date}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-deep-maroon text-lg">Rs. {order.total}</p>
          {order.itemsCount && (
            <p className="text-xs text-charcoal-grey/60">{order.itemsCount} items</p>
          )}
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4 space-y-2">
        {order.items?.slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <span className="text-xl">{item.emoji || "🥟"}</span>
            <span className="flex-1 text-charcoal-grey/80">
              {item.quantity}x {item.name}
            </span>
            <span className="text-charcoal-grey/60">Rs. {item.price}</span>
          </div>
        ))}
        {order.items?.length > 2 && (
          <p className="text-xs text-charcoal-grey/60 text-center">
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal-grey/10">
        <Link to={`${basePath}/${order.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
        {order.status === "delivered" && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => {
              // Navigate to order detail page where reorder confirmation will be shown
              window.location.href = `${basePath}/${order.id}`;
            }}
          >
            Reorder
          </Button>
        )}
      </div>
    </Card>
  );
};

export default RecentOrderCard;

