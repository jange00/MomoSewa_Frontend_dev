import { useState } from "react";
import Card from "../../../ui/cards/Card";
import Button from "../../../ui/buttons/Button";
import { FiClock, FiUser, FiShoppingBag, FiArrowRight, FiPackage } from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminOrderCard = ({ order }) => {
  // Track image load errors for each item
  const [imageErrors, setImageErrors] = useState(new Set());

  // Helper function to get product image from order item
  const getItemImage = (item) => {
    // First check direct image field on item
    if (item.image) {
      if (typeof item.image === 'string' && item.image.trim() && item.image !== 'null') {
        const trimmed = item.image.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
    }

    // Check imageUrl on item (legacy)
    if (item.imageUrl) {
      if (typeof item.imageUrl === 'string' && item.imageUrl.trim() && item.imageUrl !== 'null') {
        const trimmed = item.imageUrl.trim();
        if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
          return trimmed;
        }
      }
    }

    // Check nested product object
    if (item.product) {
      if (item.product.image) {
        if (typeof item.product.image === 'string' && item.product.image.trim() && item.product.image !== 'null') {
          const trimmed = item.product.image.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            return trimmed;
          }
        }
      }

      // Check product.images array
      if (item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
        const validImage = item.product.images.find(img => {
          if (!img || typeof img !== 'string') return false;
          const trimmed = img.trim();
          return trimmed && trimmed !== 'null' && (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/'));
        });
        if (validImage) {
          return validImage.trim();
        }
      }

      // Check legacy imageUrl
      if (item.product.imageUrl) {
        if (typeof item.product.imageUrl === 'string' && item.product.imageUrl.trim() && item.product.imageUrl !== 'null') {
          const trimmed = item.product.imageUrl.trim();
          if (trimmed.startsWith('http') || trimmed.startsWith('https') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
            return trimmed;
          }
        }
      }
    }

    // Return null if no valid image found
    return null;
  };
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
  const orderId = order._id || order.id;
  const orderDate = order.date || order.createdAt || 'Recently';
  const orderItems = order.items || order.orderItems || [];
  const orderTotal = order.total || order.amount || 0;

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
              <h3 className="font-black text-charcoal-grey text-lg mb-1">Order #{orderId}</h3>
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
              <span>{orderDate}</span>
          </p>
          
          {/* Customer Info */}
          {(order.customer || order.customerId) && (
              <div className="flex items-center gap-2 text-sm text-charcoal-grey/80 bg-charcoal-grey/5 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-deep-maroon/20 to-golden-amber/20 flex items-center justify-center">
                  <FiUser className="w-3.5 h-3.5 text-deep-maroon" />
                </div>
                <span className="font-semibold">
                  {order.customer?.name || order.customerId?.name || 'Customer'}
                </span>
            </div>
          )}
          
          {/* Vendor Info */}
          {(() => {
            const vendor = order.vendor || order.vendorId;
            // Only show vendor if it's an object with a name, not just an ID string
            if (vendor && typeof vendor === 'object' && vendor !== null) {
              const vendorName = vendor.businessName || vendor.storeName || vendor.name;
              if (vendorName) {
                return (
                  <div className="flex items-center gap-2 text-sm text-charcoal-grey/80 bg-charcoal-grey/5 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-golden-amber/20 to-deep-maroon/20 flex items-center justify-center">
                      <FiShoppingBag className="w-3.5 h-3.5 text-golden-amber" />
                    </div>
                    <span className="font-semibold truncate">{vendorName}</span>
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>
        </div>
      </div>

      {/* Order Items Preview */}
      {orderItems.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-br from-charcoal-grey/5 to-transparent rounded-xl border border-charcoal-grey/10">
          <div className="space-y-2.5">
          {orderItems.slice(0, 2).map((item, index) => {
            const itemName = item.name || item.product?.name || 'Product';
            const itemPrice = item.price || item.product?.price || 0;
            const itemQuantity = item.quantity || 1;
            const itemImage = getItemImage(item);
            const itemKey = item._id || item.id || index;
            const hasImageError = imageErrors.has(itemKey);
            const shouldShowImage = itemImage && !hasImageError;
            const itemEmoji = item.emoji || item.product?.emoji || "🥟";
            
            return (
            <div key={index} className="flex items-center gap-3 text-sm">
                {shouldShowImage ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm border border-charcoal-grey/10">
                    <img 
                      src={itemImage} 
                      alt={itemName}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setImageErrors(prev => new Set([...prev, itemKey]));
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-xl shadow-sm">
                    {itemEmoji}
                  </div>
                )}
                <span className="flex-1 text-charcoal-grey/90 font-medium">
                {itemQuantity}x {itemName}
              </span>
                <span className="text-charcoal-grey/70 font-semibold">Rs. {itemPrice.toFixed(2)}</span>
            </div>
            );
          })}
          {orderItems.length > 2 && (
              <div className="pt-2 border-t border-charcoal-grey/10">
                <p className="text-xs text-charcoal-grey/60 text-center font-medium">
              +{orderItems.length - 2} more items
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
            <p className="font-black text-deep-maroon text-xl">Rs. {orderTotal.toFixed(2)}</p>
          </div>
          {(order.itemsCount || orderItems.length) && (
            <div className="text-right">
              <p className="text-xs text-charcoal-grey/60 mb-1">Items</p>
              <p className="font-bold text-charcoal-grey">{order.itemsCount || orderItems.length}</p>
            </div>
          )}
        </div>
        <Link to={`/admin/orders/${orderId}`}>
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

