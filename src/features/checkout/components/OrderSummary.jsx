import { FiShoppingBag } from "react-icons/fi";

const OrderSummary = ({ items, subtotal, discount = 0, deliveryFee = 0 }) => {
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-golden-amber/10 flex items-center justify-center">
          <FiShoppingBag className="w-5 h-5 text-golden-amber" />
        </div>
        <h3 className="text-xl font-bold text-charcoal-grey">Order Summary</h3>
      </div>

      {/* Order Items */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {items.map((item, index) => {
          const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
          const quantity = item.quantity || 1;
          const itemKey = item._id || item.id || item.productId || `item-${index}`;
          
          return (
            <div key={itemKey} className="flex items-center gap-4 pb-4 border-b border-charcoal-grey/10 last:border-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0 border border-charcoal-grey/10">
                {item.image ? (
                  <img src={item.image} alt={item.name || 'Product'} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-2xl">🥟</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-charcoal-grey text-sm truncate">{item.name || 'Unnamed Item'}</h4>
                {item.variant && (
                  <p className="text-xs text-charcoal-grey/60 mt-1">{item.variant}</p>
                )}
                <p className="text-xs text-charcoal-grey/50 mt-1">
                  Qty: {quantity} × Rs. {price.toFixed(2)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-deep-maroon text-sm">
                  Rs. {(price * quantity).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="pt-4 border-t border-charcoal-grey/10 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-charcoal-grey/70 font-medium">Subtotal</span>
          <span className="text-charcoal-grey font-semibold">Rs. {subtotal.toFixed(2)}</span>
        </div>

        {deliveryFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-charcoal-grey/70 font-medium">Delivery Fee</span>
            <span className="text-charcoal-grey font-semibold">Rs. {deliveryFee.toFixed(2)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between items-center text-golden-amber">
            <span className="font-medium">Discount</span>
            <span className="font-semibold">- Rs. {discount.toFixed(2)}</span>
          </div>
        )}

        <div className="border-t border-charcoal-grey/10 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-charcoal-grey">Total</span>
            <span className="text-2xl font-bold text-deep-maroon">Rs. {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;

