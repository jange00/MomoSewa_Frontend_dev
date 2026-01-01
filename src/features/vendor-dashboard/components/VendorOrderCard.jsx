import { useState } from "react";
import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";
import ConfirmDialog from "../../../ui/modals/ConfirmDialog";
import { FiClock, FiUser, FiPhone, FiMapPin, FiCheck, FiX, FiPackage, FiTruck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatOrderId } from "../../../utils/formatOrderId";

// Component for individual order item with image
const OrderItemPreview = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  
  // Get product image from various possible locations
  const getItemImage = () => {
    // Check item.image first
    if (item.image && typeof item.image === 'string' && item.image.trim() && item.image !== 'null') {
      const trimmed = item.image.trim();
      if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
        return trimmed;
      }
    }
    
    // Check item.product.image
    if (item.product?.image && typeof item.product.image === 'string' && item.product.image.trim() && item.product.image !== 'null') {
      const trimmed = item.product.image.trim();
      if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
        return trimmed;
      }
    }
    
    // Check item.product.images array
    if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
      const validImage = item.product.images.find(img => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return trimmed && trimmed !== 'null' && (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/'));
      });
      if (validImage) return validImage.trim();
    }
    
    return null;
  };
  
  const itemImage = getItemImage();
  const itemEmoji = item.emoji || item.product?.emoji || "🥟";
  
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex-shrink-0 border border-charcoal-grey/10 relative">
        {itemImage && !imageError ? (
          <img
            src={itemImage}
            alt={item.name || 'Product'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-xl">{itemEmoji}</span>
        )}
      </div>
      <span className="flex-1 text-charcoal-grey/80">
        {item.quantity}x {item.name}
      </span>
      <span className="text-charcoal-grey/60">Rs. {item.price}</span>
    </div>
  );
};

const VendorOrderCard = ({ order, onStatusUpdate }) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    variant: "danger",
  });
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

  const handleStatusUpdate = (newStatus) => {
    // Use _id for API calls (backend expects MongoDB ObjectId)
    const orderIdForApi = order._id || order.id;
    
    if (!orderIdForApi) {
      console.error('Order ID not found for status update');
      return;
    }
    
    if (newStatus === "cancelled") {
      setConfirmDialog({
        isOpen: true,
        title: "Cancel Order",
        message: `Are you sure you want to cancel order #${formatOrderId(order)}? This action cannot be undone.`,
        onConfirm: () => {
          if (onStatusUpdate) {
            onStatusUpdate(orderIdForApi, newStatus);
          }
        },
        variant: "danger",
      });
      return;
    }
    if (onStatusUpdate) {
      onStatusUpdate(orderIdForApi, newStatus);
    }
  };

  const canAccept = order.status === "pending";
  const canReject = order.status === "pending";
  const canStartPreparing = order.status === "pending";
  const canMarkReady = order.status === "preparing";
  const canMarkOnWay = order.status === "preparing";
  const canMarkDelivered = order.status === "on-the-way";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-charcoal-grey">Order #{formatOrderId(order)}</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-charcoal-grey/60 flex items-center gap-1 mb-2">
            <FiClock className="w-4 h-4" />
            {order.date}
          </p>
          
          {/* Customer Information */}
          {order.customer && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-charcoal-grey/80">
                <FiUser className="w-4 h-4 text-charcoal-grey/60" />
                <span className="font-medium">{order.customer.name}</span>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                  <FiPhone className="w-4 h-4 text-charcoal-grey/60" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
              {order.customer.address && (
                <div className="flex items-start gap-2 text-sm text-charcoal-grey/70">
                  <FiMapPin className="w-4 h-4 text-charcoal-grey/60 mt-0.5" />
                  <span className="flex-1">{order.customer.address}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="font-bold text-deep-maroon text-lg">Rs. {order.total}</p>
          {order.itemsCount && (
            <p className="text-xs text-charcoal-grey/60">{order.itemsCount} items</p>
          )}
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="mb-4 space-y-2 pb-4 border-b border-charcoal-grey/10">
        {order.items?.slice(0, 3).map((item, index) => (
          <OrderItemPreview key={index} item={item} />
        ))}
        {order.items?.length > 3 && (
          <p className="text-xs text-charcoal-grey/60 text-center">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      {/* Vendor Actions */}
      <div className="flex items-center gap-2 pt-4">
        {canAccept && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => handleStatusUpdate("preparing")}
          >
            <FiCheck className="w-4 h-4" />
            Accept & Start Preparing
          </Button>
        )}
        {canReject && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusUpdate("cancelled")}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <FiX className="w-4 h-4" />
            Reject
          </Button>
        )}
        {canStartPreparing && !canAccept && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => handleStatusUpdate("preparing")}
          >
            <FiPackage className="w-4 h-4" />
            Start Preparing
          </Button>
        )}
        {canMarkReady && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => handleStatusUpdate("on-the-way")}
          >
            <FiTruck className="w-4 h-4" />
            Mark Ready for Delivery
          </Button>
        )}
        {canMarkOnWay && !canMarkReady && (
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => handleStatusUpdate("on-the-way")}
          >
            <FiTruck className="w-4 h-4" />
            Mark On the Way
          </Button>
        )}
        {canMarkDelivered && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => handleStatusUpdate("delivered")}
          >
            <FiCheck className="w-4 h-4" />
            Mark as Delivered
          </Button>
        )}
        {order.status === "delivered" && (
          <Link to={`/vendor/orders/${order._id || order.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        )}
        {(order.status === "preparing" || order.status === "on-the-way") && (
          <Link to={`/vendor/orders/${order._id || order.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Confirm"
        cancelText="Cancel"
        variant={confirmDialog.variant}
      />
    </Card>
  );
};

export default VendorOrderCard;

