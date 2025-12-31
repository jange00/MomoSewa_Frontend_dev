const PriceSummary = ({ subtotal, discount = 0, deliveryFee = 0, amountNeededForFreeDelivery = 0 }) => {
  const total = subtotal + deliveryFee - discount;
  const isFreeDelivery = deliveryFee === 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-charcoal-grey/10 p-6 space-y-4">
      <h3 className="text-xl font-bold text-charcoal-grey mb-6">Price Summary</h3>
      
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-charcoal-grey/70 font-medium">Subtotal</span>
          <span className="text-charcoal-grey font-semibold">Rs. {subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-golden-amber">
            <span className="font-medium">Discount</span>
            <span className="font-semibold">- Rs. {discount.toFixed(2)}</span>
          </div>
        )}

        {/* Delivery Fee */}
        <div className="flex justify-between items-center">
          <span className="text-charcoal-grey/70 font-medium">Delivery Fee</span>
          <span className={`font-semibold ${isFreeDelivery ? 'text-golden-amber' : 'text-charcoal-grey'}`}>
            {isFreeDelivery ? 'FREE' : `Rs. ${deliveryFee.toFixed(2)}`}
          </span>
        </div>

        {/* Free Delivery Message */}
        {!isFreeDelivery && amountNeededForFreeDelivery > 0 && (
          <div className="bg-golden-amber/10 border border-golden-amber/20 rounded-xl p-3 mt-2">
            <p className="text-xs text-golden-amber font-medium text-center">
              Add Rs. {amountNeededForFreeDelivery.toFixed(2)} more for <span className="font-bold">FREE delivery</span>!
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-charcoal-grey/10 my-4"></div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xl font-bold text-charcoal-grey">Total</span>
          <span className="text-2xl font-bold text-deep-maroon">Rs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;

