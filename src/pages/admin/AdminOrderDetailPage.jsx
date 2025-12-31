import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiClock, 
  FiMapPin, 
  FiPackage, 
  FiUser,
  FiShoppingBag,
  FiPrinter,
  FiMail,
  FiPhone
} from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Button from "../../ui/buttons/Button";
import Badge from "../../ui/badges/Badge";
import { OrderCardSkeleton } from "../../ui/skeletons";
import { useGet } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch order from API
  const { data: orderData, isLoading } = useGet(
    `admin-order-${id}`,
    `${API_ENDPOINTS.ORDERS}/${id}`,
    { showErrorToast: true, enabled: !!id }
  );

  const order = orderData?.data?.order || orderData?.data || null;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <OrderCardSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/admin/orders">
            <Button variant="ghost" size="sm" className="mb-6">
              <FiArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-charcoal-grey mb-2">Order Not Found</h3>
            <p className="text-charcoal-grey/60 mb-6">
              The order you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/admin/orders">
              <Button variant="primary" size="md">
                View All Orders
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Use human-readable orderId if available, fallback to _id or id
  const orderId = order.orderId || order._id || order.id;
  const orderDate = order.date || order.createdAt || 'Recently';
  const orderItems = order.items || order.orderItems || [];

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
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-charcoal-grey">Order #{orderId}</h1>
              <p className="text-charcoal-grey/70 mt-1">Order Details</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.bg} ${status.text} ${status.border}`}
            >
              {statusLabel}
            </span>
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-charcoal-grey mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item, index) => {
                  const itemName = item.name || item.product?.name || 'Product';
                  const itemPrice = item.price || item.product?.price || 0;
                  const itemQuantity = item.quantity || 1;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-charcoal-grey/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.emoji || "🥟"}</span>
                        <div>
                          <h3 className="font-semibold text-charcoal-grey">{itemName}</h3>
                          <p className="text-sm text-charcoal-grey/60">Quantity: {itemQuantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-deep-maroon">Rs. {itemPrice.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-charcoal-grey mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiMapPin className="w-5 h-5 text-charcoal-grey/60 mt-1" />
                  <div>
                    <p className="font-semibold text-charcoal-grey">Delivery Address</p>
                    <p className="text-charcoal-grey/70">
                      {order.deliveryAddress || 
                       (order.deliveryAddressObj ? 
                         `${order.deliveryAddressObj.address || ''}, ${order.deliveryAddressObj.area || ''}, ${order.deliveryAddressObj.city || ''}` 
                         : 'No address provided')}
                    </p>
                  </div>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex items-start gap-3">
                    <FiClock className="w-5 h-5 text-charcoal-grey/60 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal-grey">Estimated Delivery</p>
                      <p className="text-charcoal-grey/70">{order.estimatedDelivery}</p>
                    </div>
                  </div>
                )}
                {order.deliveredDate && (
                  <div className="flex items-start gap-3">
                    <FiClock className="w-5 h-5 text-charcoal-grey/60 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal-grey">Delivered On</p>
                      <p className="text-charcoal-grey/70">{order.deliveredDate}</p>
                    </div>
                  </div>
                )}
                {(order.notes || order.deliveryNotes || order.instructions) && (
                  <div className="flex items-start gap-3">
                    <FiPackage className="w-5 h-5 text-charcoal-grey/60 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal-grey">Special Notes</p>
                      <p className="text-charcoal-grey/70">{order.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            {order.customer && (
              <Card className="p-6">
                <h2 className="text-xl font-black text-charcoal-grey mb-4">Customer</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg">
                      {(order.customer.name || order.customerId?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-grey">
                        {order.customer.name || order.customerId?.name || 'Customer'}
                      </p>
                    </div>
                  </div>
                  {(order.customer.email || order.customerId?.email) && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiMail className="w-4 h-4" />
                      <span>{order.customer.email || order.customerId?.email}</span>
                    </div>
                  )}
                  {(order.customer.phone || order.customerId?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiPhone className="w-4 h-4" />
                      <span>{order.customer.phone || order.customerId?.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Vendor Information */}
            {order.vendor && (
              <Card className="p-6">
                <h2 className="text-xl font-black text-charcoal-grey mb-4">Vendor</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-lg">
                      {(order.vendor.name || order.vendorId?.name || order.vendor.businessName || 'V').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-grey">
                        {order.vendor.businessName || order.vendorId?.businessName || order.vendor.name || 'Vendor'}
                      </p>
                      {order.vendor.name && (
                        <p className="text-xs text-charcoal-grey/60">{order.vendor.name}</p>
                      )}
                    </div>
                  </div>
                  {(order.vendor.email || order.vendorId?.email) && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiMail className="w-4 h-4" />
                      <span>{order.vendor.email || order.vendorId?.email}</span>
                    </div>
                  )}
                  {(order.vendor.phone || order.vendorId?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-grey/70">
                      <FiPhone className="w-4 h-4" />
                      <span>{order.vendor.phone || order.vendorId?.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-charcoal-grey mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-grey/70">Subtotal</span>
                  <span className="font-semibold">
                    Rs. {(order.subtotal || order.amount || 0).toFixed(2)}
                  </span>
                </div>
                {(order.deliveryFee || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Delivery Fee</span>
                    <span className="font-semibold">Rs. {(order.deliveryFee || 0).toFixed(2)}</span>
                  </div>
                )}
                {(order.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Discount</span>
                    <span className="font-semibold text-green-600">
                      -Rs. {(order.discount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-charcoal-grey/10 pt-3 flex justify-between">
                  <span className="font-bold text-charcoal-grey">Total</span>
                  <span className="font-black text-deep-maroon text-lg">
                    Rs. {(order.total || order.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-charcoal-grey/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal-grey/70">Payment Method</span>
                    <span className="font-semibold">
                      {order.paymentMethod || order.payment?.method || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;

